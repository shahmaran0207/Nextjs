// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// ─────────────────────────────────────────────────────────────────────────────
// Marketplace: Phase 2 학습용 마켓플레이스 컨트랙트
//
// [학습 포인트 1] 다른 컨트랙트(ERC-721)와 상호작용
//   - IERC721 인터페이스를 통해 배포된 MyNFT 컨트랙트를 호출합니다.
//
// [학습 포인트 2] 위임장 확인 (getApproved)
//   - 소유자가 마켓플레이스에게 전송 권한을 줬는지 확인합니다.
//
// [학습 포인트 3] 데이터 구조체 (Struct)
//   - 특정 tokenId가 얼마에 올라와 있는지, 판매자인지는 누구인지 기록합니다.
// ─────────────────────────────────────────────────────────────────────────────

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract Marketplace {

    // ── 상태 변수 ─────────────────────────────────────────────────────────

    // 어떤 NFT 컨트랙트를 취급할지 가리키는 포인터
    IERC721 public nftContract;

    // ── Phase 4: 수수료 관련 변수 ──
    address public owner; // 마켓 운영자
    uint256 public feePercent = 250; // 기본 플랫폼 수수료 2.5% (250 BPS)

    // 진열대 상품(Listing) 구조체
    struct Listing {
        address seller; // 판매자 주소
        uint256 price;  // 가격 (wei 단위)
        bool active;    // 현재 판매 중인지 여부
    }

    // tokenId → 진열대 상품 정보 매핑
    mapping(uint256 => Listing) public listings;

    // ── 이벤트 ────────────────────────────────────────────────────────────

    event ItemListed(uint256 indexed tokenId, address indexed seller, uint256 price);
    event ItemCanceled(uint256 indexed tokenId, address indexed seller);
    event ItemSold(uint256 indexed tokenId, address indexed buyer, uint256 price);

    // ── 생성자 ────────────────────────────────────────────────────────────

    /**
     * @notice 컨트랙트 배포 시, 연동할 NFT 컨트랙트 주소를 받습니다.
     * @param _nftAddress  배포된 MyNFT 주소
     */
    constructor(address _nftAddress) {
        require(_nftAddress != address(0), "Marketplace: invalid address");
        nftContract = IERC721(_nftAddress);
        owner = msg.sender; // 배포자를 마켓 운영자로 설정
    }

    // ── 핵심 함수: 리스팅 (판매 등록) ───────────────────────────────────────

    /**
     * @notice 내 NFT를 마켓에 판매 등록합니다.
     * @param tokenId  팔고자 하는 NFT의 고유 번호
     * @param price    희망 판매 가격 (wei)
     */
    function listNFT(uint256 tokenId, uint256 price) external {
        // 1. 소유자 검증
        // 내가 주인이 맞는지 확인 (남의 것을 팔 수 없음)
        address owner = nftContract.ownerOf(tokenId);
        require(owner == msg.sender, "Marketplace: you are not the owner");

        // 2. 가격 검증
        require(price > 0, "Marketplace: price must be greater than zero");

        // 3. ✨ 권한 위임(Approve) 검증 ✨
        // 내가 이 컨트랙트(Marketplace)에게 대신 팔 수 있는 권한을 주었는가?
        // 만약 주지 않았다면 여기서 에러가 발생하여 트랜잭션이 취소됩니다.
        address approvedAddress = nftContract.getApproved(tokenId);
        bool isApprovedForAll = nftContract.isApprovedForAll(owner, address(this));

        require(
            approvedAddress == address(this) || isApprovedForAll,
            "Marketplace: marketplace is not approved to transfer this NFT"
        );

        // 4. 장부 기록 (진열대에 올림)
        listings[tokenId] = Listing({
            seller: msg.sender,
            price: price,
            active: true
        });

        // 5. 알림(이벤트) 발생
        emit ItemListed(tokenId, msg.sender, price);
    }

    // ── 리스팅 취소 ────────────────────────────────────────────────────────

    /**
     * @notice 판매 등록을 취소하고 진열대에서 내립니다.
     */
    function cancelListing(uint256 tokenId) external {
        Listing memory listing = listings[tokenId];
        
        require(listing.active, "Marketplace: not listed");
        require(listing.seller == msg.sender, "Marketplace: you are not the seller");

        // active를 false로 변경하여 진열대에서 내림
        listings[tokenId].active = false;

        emit ItemCanceled(tokenId, msg.sender);
    }

    // ── 핵심 함수: 구매 (Buy) ──────────────────────────────────────────────

    /**
     * @notice 마켓에 올라온 NFT를 이더리움을 지불하고 구매합니다.
     * @param tokenId 구매할 NFT 고유 번호
     */
    function buyNFT(uint256 tokenId) external payable {
        Listing memory listing = listings[tokenId];

        // 1. Checks (검증)
        // 진열대에 있는 물건인지 확인
        require(listing.active, "Marketplace: item is not for sale");
        // 보낸 돈이 가격과 일치하는지 확인
        require(msg.value == listing.price, "Marketplace: incorrect price");

        // 2. Effects (상태 변경) ✨ 매우 중요: 돈과 물건을 주기 전에 장부부터 지웁니다!
        listings[tokenId].active = false;

        // 3. Interactions (상호작용/전송)
        // 3-0. 수수료 계산 (Phase 4)
        uint256 fee = (msg.value * feePercent) / 10000;
        uint256 sellerAmount = msg.value - fee;

        // 3-1. NFT를 판매자에게서 구매자(msg.sender)에게 전송
        nftContract.transferFrom(listing.seller, msg.sender, tokenId);

        // 3-2. 판매자에게 수수료를 뺀 금액 송금
        // (fee 금액은 현재 컨트랙트 주소 address(this) 에 고스란히 남게 됩니다)
        payable(listing.seller).transfer(sellerAmount);

        // 4. 알림(이벤트) 발생
        emit ItemSold(tokenId, msg.sender, msg.value);
    }

    // ── 관리자 전용: 수수료 인출 (Phase 4) ───────────────────────────────

    /**
     * @notice 컨트랙트에 쌓인 수수료를 마켓 운영자가 인출합니다.
     */
    function withdrawFee() external {
        require(msg.sender == owner, "Marketplace: only owner can withdraw");
        
        uint256 balance = address(this).balance;
        require(balance > 0, "Marketplace: no fees to withdraw");

        // 컨트랙트의 모든 잔액(수수료)을 운영자에게 송금
        payable(owner).transfer(balance);
    }
}
