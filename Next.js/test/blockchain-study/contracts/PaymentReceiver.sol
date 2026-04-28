// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// ─────────────────────────────────────────────────────────────
// PaymentReceiver: 크로스체인 멀티 결제 수신 컨트랙트
//
// 역할:
//   - 사용자가 pay(orderId)를 호출하면 ETH를 받고 이벤트 발생
//   - 결제 서버(Node.js)가 이 이벤트를 감지해 주문 완료 처리
//   - 3개 체인(A, B, C)에 각각 동일하게 배포됨
//
// 흐름:
//   프론트엔드 → MetaMask 서명 → pay(orderId) 호출
//       → PaymentReceived 이벤트 발생
//           → 결제 서버가 이벤트 감지 → 주문 완료 처리
// ─────────────────────────────────────────────────────────────
contract PaymentReceiver {

    // ── 상태 변수 ─────────────────────────────────────────────

    address public owner;
    // 컨트랙트 배포자. ETH 출금 권한을 가짐.

    // ── 이벤트 ───────────────────────────────────────────────

    event PaymentReceived(
        address indexed payer,   // 결제한 지갑 주소
        uint256 amount,          // 결제 금액 (wei 단위)
        string  orderId          // 주문 번호 (프론트-서버 매칭용)
    );
    // 결제 서버가 이 이벤트를 구독해 주문 완료를 감지한다.
    // "indexed payer" = 특정 주소의 결제 내역만 빠르게 필터링 가능.

    event Withdrawn(
        address indexed to,
        uint256 amount
    );
    // owner가 ETH를 출금할 때 발생하는 이벤트.

    // ── 생성자 ───────────────────────────────────────────────

    constructor() {
        owner = msg.sender;
        // 배포 시 배포자를 owner로 설정.
    }

    // ── 수식어 ───────────────────────────────────────────────

    modifier onlyOwner() {
        require(msg.sender == owner, "PaymentReceiver: not owner");
        _;
        // owner 전용 함수 접근 제어.
        // require 실패 시 트랜잭션 전체 롤백.
    }

    // ── 핵심 함수: 결제 수신 ──────────────────────────────────

    function pay(string calldata orderId) external payable {
        // external = 컨트랙트 외부(사용자, 프론트엔드)에서만 호출 가능
        // payable  = ETH를 함께 받을 수 있음 (msg.value에 금액이 담김)
        // calldata = 문자열을 가스 효율적으로 읽기 전용으로 받음

        require(msg.value > 0, "PaymentReceiver: amount must be > 0");
        // 0 ETH 결제는 거부.

        emit PaymentReceived(msg.sender, msg.value, orderId);
        // 이벤트 발생 → 결제 서버가 감지 → 주문 완료 처리
        // 이 이벤트가 블록체인에 영구 기록됨 (영수증 역할).
    }

    // ── 관리자 함수: ETH 출금 ─────────────────────────────────

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        // address(this).balance = 이 컨트랙트가 보유한 ETH 총액

        require(balance > 0, "PaymentReceiver: nothing to withdraw");

        (bool sent, ) = owner.call{value: balance}("");
        // call{value: ...} = 저수준 ETH 전송 방식 (가장 안전한 방법)
        // transfer()는 gas 제한이 있어 일부 상황에서 실패할 수 있어
        // call()을 권장함.

        require(sent, "PaymentReceiver: withdraw failed");

        emit Withdrawn(owner, balance);
    }

    // ── 조회 함수 ─────────────────────────────────────────────

    function getBalance() external view returns (uint256) {
        return address(this).balance;
        // 이 컨트랙트가 현재 보유한 ETH 잔액 반환.
        // view = 상태 변경 없음 → 가스비 0.
    }
}
