// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// ─────────────────────────────────────────────────────────────────────────
// LandNFT: 가상 부동산 ERC-721 NFT 컨트랙트
//
// 핵심 로직:
//   관리자가 registerParcel()로 구역을 등록하면
//   누구든 purchase()를 호출해 ETH를 내고 해당 구역의 NFT를 발행받음.
//   ETH는 수혜자(beneficiary) 주소로 즉시 전달됨.
//
// ERC-721 최소 구현 (OpenZeppelin 미사용):
//   소유권 매핑, Transfer 이벤트, transferFrom, approve 등을 직접 구현.
//   목적은 학습 + Ganache 로컬 환경 테스트이므로 필수 기능만 포함.
// ─────────────────────────────────────────────────────────────────────────
contract LandNFT {

    // ── ERC-721 상태 변수 ──────────────────────────────────────────────

    string public name     = "LandNFT";
    string public symbol   = "LAND";

    uint256 private _totalMinted;
    // 지금까지 발행된 총 NFT 수. 새 토큰 ID는 ++_totalMinted.

    mapping(uint256 => address) private _owners;
    // tokenId => 소유자 주소

    mapping(address => uint256) private _balances;
    // 주소 => 보유 NFT 수

    mapping(uint256 => address) private _tokenApprovals;
    // tokenId => 이전 승인된 주소 (1:1 approve)

    mapping(address => mapping(address => bool)) private _operatorApprovals;
    // owner => (operator => approved) (setApprovalForAll)

    // ── Land 도메인 상태 변수 ──────────────────────────────────────────

    address public owner;
    // 컨트랙트 배포자 = 관리자. registerParcel 권한 보유.

    address payable public beneficiary;
    // 구역 판매 수익(ETH)이 전송되는 수혜자 주소 (보통 서비스 운영자).

    struct Parcel {
        uint256 dbParcelId; // Next.js DB의 land_parcels.id
        string  name;       // 구역 이름 (예: "해운대 A구역")
        uint256 price;      // 판매 가격 (wei 단위)
        bool    registered; // 등록 여부
        bool    sold;       // 판매 완료 여부
    }

    mapping(uint256 => Parcel)  public parcels;
    // dbParcelId => Parcel 구조체

    mapping(uint256 => uint256) public parcelToToken;
    // dbParcelId => 발행된 NFT tokenId (판매 후 기록됨)

    mapping(uint256 => uint256) public tokenToParcel;
    // tokenId => dbParcelId (역방향 조회)

    // ── 이벤트 ────────────────────────────────────────────────────────

    // ERC-721 표준 이벤트
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed tokenOwner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed tokenOwner, address indexed operator, bool approved);

    // Land 도메인 이벤트
    event ParcelRegistered(uint256 indexed dbParcelId, string name, uint256 price);
    // 구역이 새로 등록될 때 발생 → 서버에서 감지 가능

    event LandPurchased(
        uint256 indexed dbParcelId,
        uint256 indexed tokenId,
        address indexed buyer,
        uint256 pricePaid
    );
    // 구역 구매가 완료될 때 발생 → DB 소유권 업데이트 트리거로 활용

    // ── 생성자 ────────────────────────────────────────────────────────

    constructor(address payable _beneficiary) {
        owner       = msg.sender;
        beneficiary = _beneficiary;
    }

    // ── 접근 제어 ─────────────────────────────────────────────────────

    modifier onlyOwner() {
        require(msg.sender == owner, "LandNFT: caller is not owner");
        _;
    }

    // ── 관리자 함수 ───────────────────────────────────────────────────

    /**
     * @notice 판매할 구역을 컨트랙트에 등록 (관리자 전용)
     * @param dbParcelId  Next.js DB의 land_parcels.id
     * @param _name       구역 이름
     * @param priceEther  판매 가격 (ETH 단위 정수, 예: 0.1 ETH → 0.1 * 10^18 wei)
     *
     * 구역 등록과 DB 구역 생성은 독립적임:
     *   - DB에 구역 등록 후 이 함수를 호출해 컨트랙트와 동기화해야 실제 구매 가능.
     */
    function registerParcel(
        uint256 dbParcelId,
        string calldata _name,
        uint256 priceEther
    ) external onlyOwner {
        require(!parcels[dbParcelId].registered, "LandNFT: already registered");
        parcels[dbParcelId] = Parcel({
            dbParcelId:  dbParcelId,
            name:        _name,
            price:       priceEther,
            registered:  true,
            sold:        false
        });
        emit ParcelRegistered(dbParcelId, _name, priceEther);
    }

    /**
     * @notice 가격 변경 (관리자 전용, 미판매 구역만 가능)
     */
    function setPrice(uint256 dbParcelId, uint256 newPrice) external onlyOwner {
        require(parcels[dbParcelId].registered, "LandNFT: not registered");
        require(!parcels[dbParcelId].sold, "LandNFT: already sold");
        parcels[dbParcelId].price = newPrice;
    }

    /**
     * @notice 수혜자 주소 변경 (관리자 전용)
     */
    function setBeneficiary(address payable _beneficiary) external onlyOwner {
        beneficiary = _beneficiary;
    }

    // ── 구매 함수 ─────────────────────────────────────────────────────

    /**
     * @notice 구역을 ETH로 구매하고 NFT를 발행받음
     * @param dbParcelId  구매할 구역의 DB ID
     *
     * 호출자는 정확히 parcel.price 이상의 ETH를 msg.value로 전송해야 함.
     * 초과 지불 시 나머지는 다시 호출자에게 반환됨.
     */
    function purchase(uint256 dbParcelId) external payable {
        Parcel storage parcel = parcels[dbParcelId];

        require(parcel.registered,      "LandNFT: parcel not registered");
        require(!parcel.sold,           "LandNFT: parcel already sold");
        require(msg.value >= parcel.price, "LandNFT: insufficient ETH");

        // 판매 완료 처리
        parcel.sold = true;

        // NFT 발행
        uint256 tokenId = ++_totalMinted;
        parcelToToken[dbParcelId] = tokenId;
        tokenToParcel[tokenId]    = dbParcelId;
        _mint(msg.sender, tokenId);

        // ETH를 수혜자에게 전송 (과납 시 차액 반환)
        uint256 excess = msg.value - parcel.price;
        (bool sent, ) = beneficiary.call{value: parcel.price}("");
        require(sent, "LandNFT: ETH transfer to beneficiary failed");

        if (excess > 0) {
            (bool refunded, ) = payable(msg.sender).call{value: excess}("");
            require(refunded, "LandNFT: refund failed");
        }

        emit LandPurchased(dbParcelId, tokenId, msg.sender, parcel.price);
    }

    // ── 조회 함수 ─────────────────────────────────────────────────────

    function getParcel(uint256 dbParcelId) external view returns (
        string memory parcelName,
        uint256 price,
        bool registered,
        bool sold
    ) {
        Parcel storage p = parcels[dbParcelId];
        return (p.name, p.price, p.registered, p.sold);
    }

    function totalMinted() external view returns (uint256) {
        return _totalMinted;
    }

    // ── ERC-721 표준 구현 ─────────────────────────────────────────────

    function balanceOf(address _owner) external view returns (uint256) {
        require(_owner != address(0), "ERC721: zero address");
        return _balances[_owner];
    }

    function ownerOf(uint256 tokenId) public view returns (address) {
        address tokenOwner = _owners[tokenId];
        require(tokenOwner != address(0), "ERC721: nonexistent token");
        return tokenOwner;
    }

    function approve(address to, uint256 tokenId) external {
        address tokenOwner = ownerOf(tokenId);
        require(msg.sender == tokenOwner || _operatorApprovals[tokenOwner][msg.sender],
            "ERC721: not authorized");
        _tokenApprovals[tokenId] = to;
        emit Approval(tokenOwner, to, tokenId);
    }

    function getApproved(uint256 tokenId) external view returns (address) {
        require(_owners[tokenId] != address(0), "ERC721: nonexistent token");
        return _tokenApprovals[tokenId];
    }

    function setApprovalForAll(address operator, bool approved) external {
        require(operator != msg.sender, "ERC721: approve to caller");
        _operatorApprovals[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    function isApprovedForAll(address _owner, address operator) external view returns (bool) {
        return _operatorApprovals[_owner][operator];
    }

    function transferFrom(address from, address to, uint256 tokenId) external {
        address tokenOwner = ownerOf(tokenId);
        require(
            msg.sender == tokenOwner ||
            msg.sender == _tokenApprovals[tokenId] ||
            _operatorApprovals[tokenOwner][msg.sender],
            "ERC721: not authorized"
        );
        _transfer(from, to, tokenId);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId) external {
        address tokenOwner = ownerOf(tokenId);
        require(
            msg.sender == tokenOwner ||
            msg.sender == _tokenApprovals[tokenId] ||
            _operatorApprovals[tokenOwner][msg.sender],
            "ERC721: not authorized"
        );
        _transfer(from, to, tokenId);
    }

    function supportsInterface(bytes4 interfaceId) external pure returns (bool) {
        // ERC-165: 0x80ac58cd = ERC-721, 0x01ffc9a7 = ERC-165
        return interfaceId == 0x80ac58cd || interfaceId == 0x01ffc9a7;
    }

    // ── 내부 헬퍼 ────────────────────────────────────────────────────

    function _mint(address to, uint256 tokenId) internal {
        require(to != address(0), "ERC721: mint to zero address");
        _owners[tokenId]    = to;
        _balances[to]      += 1;
        emit Transfer(address(0), to, tokenId);
    }

    function _transfer(address from, address to, uint256 tokenId) internal {
        require(ownerOf(tokenId) == from, "ERC721: wrong owner");
        require(to != address(0), "ERC721: transfer to zero address");
        delete _tokenApprovals[tokenId];
        _balances[from]    -= 1;
        _balances[to]      += 1;
        _owners[tokenId]    = to;
        emit Transfer(from, to, tokenId);
    }
}
