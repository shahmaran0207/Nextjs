// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// ─────────────────────────────────────────────────────────────────────────────
// MyNFT: Phase 1 학습용 ERC-721 NFT 컨트랙트
//
// [학습 포인트 1] ERC-721 상속
//   - OpenZeppelin ERC721을 상속하면 balanceOf, ownerOf,
//     transferFrom, approve 등 표준 함수가 자동 구현됨
//
// [학습 포인트 2] Ownable
//   - onlyOwner 모디파이어 → 배포자만 호출 가능한 함수에 사용
//
// [학습 포인트 3] payable
//   - 함수에 payable 키워드 → ETH를 받을 수 있음
//   - msg.value → 호출자가 보낸 ETH 금액 (wei 단위)
// ─────────────────────────────────────────────────────────────────────────────

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyNFT is ERC721, Ownable {

    // ── 상태 변수 ─────────────────────────────────────────────────────────

    uint256 private _nextTokenId;
    // 다음에 발행할 tokenId. mint할 때마다 1씩 증가 (0, 1, 2 ...)

    uint256 public mintPrice;
    // 민팅 가격 (wei). 0이면 무료.

    uint256 public maxSupply;
    // 최대 발행 수량. 0이면 무제한.

    mapping(uint256 => string) private _tokenNames;
    // tokenId → NFT 이름 (메타데이터 대신 단순 이름으로 학습)

    // ── 이벤트 ────────────────────────────────────────────────────────────

    event NFTMinted(uint256 indexed tokenId, address indexed owner, string name);

    // ── 생성자 ────────────────────────────────────────────────────────────

    constructor(uint256 _mintPrice, uint256 _maxSupply)
        ERC721("MyNFT", "MNFT")   // 컬렉션 이름과 심볼
        // v4: Ownable()은 인수 없음, 자동으로 msg.sender가 owner가 됨
    {
        mintPrice = _mintPrice;
        maxSupply = _maxSupply;
    }

    // ── 민팅 ──────────────────────────────────────────────────────────────

    /**
     * @notice NFT를 발행합니다.
     * @param name  이 NFT에 붙일 이름
     */
    function mint(string calldata name) external payable returns (uint256) {
        // 가격 체크 (mintPrice == 0 이면 무료이므로 항상 통과)
        require(msg.value >= mintPrice, "MyNFT: insufficient payment");

        // 최대 발행량 체크 (maxSupply == 0 이면 무제한)
        if (maxSupply > 0) {
            require(_nextTokenId < maxSupply, "MyNFT: max supply reached");
        }

        uint256 tokenId = _nextTokenId++;

        // _safeMint: 수신자가 컨트랙트라면 ERC721Receiver 구현 여부 확인
        _safeMint(msg.sender, tokenId);

        _tokenNames[tokenId] = name;

        emit NFTMinted(tokenId, msg.sender, name);
        return tokenId;
    }

    // ── 조회 ──────────────────────────────────────────────────────────────

    /** @notice 지금까지 발행된 총 NFT 수 */
    function totalMinted() external view returns (uint256) {
        return _nextTokenId;
    }

    /** @notice tokenId에 해당하는 NFT 이름 */
    function getTokenName(uint256 tokenId) external view returns (string memory) {
        require(_nextTokenId > tokenId, "MyNFT: nonexistent token");
        return _tokenNames[tokenId];
    }

    /** @notice ERC-721 표준 메타데이터 URL (학습용 더미) */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_nextTokenId > tokenId, "MyNFT: nonexistent token");
        return string.concat("mynft://", _tokenNames[tokenId]);
    }

    // ── 관리자 ────────────────────────────────────────────────────────────

    /** @notice 민팅 가격 변경 (owner 전용) */
    function setMintPrice(uint256 _price) external onlyOwner {
        mintPrice = _price;
    }

    /**
     * @notice 컨트랙트에 쌓인 ETH 인출 (owner 전용)
     * .call{value}("") 방식이 현재 권장 패턴
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "MyNFT: nothing to withdraw");
        (bool ok, ) = payable(owner()).call{value: balance}("");
        require(ok, "MyNFT: withdraw failed");
    }
}
