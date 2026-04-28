// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// ─────────────────────────────────────────────────────────────
// PaymentReceiver: 크로스체인 멀티 결제 수신 컨트랙트 (즉시 포워딩 버전)
//
// 역할:
//   - 사용자가 pay(orderId)를 호출하면 ETH를 받고 이벤트 발생
//   - ETH를 컨트랙트에 보관하지 않고 recipient 주소로 즉시 포워딩
//   - 결제 서버(Node.js)가 이 이벤트를 감지해 주문 완료 처리
//   - 3개 체인(A, B, C)에 각각 동일하게 배포됨
//
// 흐름:
//   프론트엔드 → MetaMask 서명 → pay(orderId) 호출
//       → ETH 즉시 recipient 전달 + PaymentReceived 이벤트 발생
//           → 결제 서버가 이벤트 감지 → 주문 완료 처리
// ─────────────────────────────────────────────────────────────
contract PaymentReceiver {

    // ── 상태 변수 ─────────────────────────────────────────────

    address public owner;
    // 컨트랙트 배포자. recipient 변경 권한을 가짐.

    address payable public recipient;
    // ETH를 즉시 받는 주소 (판매자/수취인 지갑).
    // pay() 호출 시 ETH가 이 주소로 바로 전달됨.

    // ── 이벤트 ───────────────────────────────────────────────

    event PaymentReceived(
        address indexed payer,   // 결제한 지갑 주소
        uint256 amount,          // 결제 금액 (wei 단위)
        string  orderId          // 주문 번호 (프론트-서버 매칭용)
    );
    // 결제 서버가 이 이벤트를 구독해 주문 완료를 감지한다.

    event RecipientChanged(
        address indexed oldRecipient,
        address indexed newRecipient
    );
    // owner가 recipient를 변경할 때 발생.

    // ── 생성자 ───────────────────────────────────────────────

    constructor(address payable _recipient) {
        owner     = msg.sender;
        recipient = _recipient;
        // 배포 시 owner와 recipient를 설정.
        // owner     = 배포자 (설정 변경 권한)
        // recipient = ETH를 실제로 받는 주소 (판매자 지갑)
    }

    // ── 수식어 ───────────────────────────────────────────────

    modifier onlyOwner() {
        require(msg.sender == owner, "PaymentReceiver: not owner");
        _;
    }

    // ── 핵심 함수: 결제 수신 + 즉시 포워딩 ───────────────────

    function pay(string calldata orderId) external payable {
        // external = 컨트랙트 외부(사용자, 프론트엔드)에서만 호출 가능
        // payable  = ETH를 함께 받을 수 있음 (msg.value에 금액이 담김)

        require(msg.value > 0, "PaymentReceiver: amount must be > 0");
        // 0 ETH 결제는 거부.

        // ETH를 recipient 주소로 즉시 포워딩
        // 컨트랙트에 ETH를 보관하지 않음 → 보안 위험 감소
        (bool sent, ) = recipient.call{value: msg.value}("");
        require(sent, "PaymentReceiver: forward failed");
        // call{value: ...} = 저수준 ETH 전송 (가장 안전한 방식)

        emit PaymentReceived(msg.sender, msg.value, orderId);
        // 이벤트 발생 → 결제 서버가 감지 → 주문 완료 처리
        // 이 이벤트가 블록체인에 영구 기록됨 (영수증 역할).
    }

    // ── 관리자 함수: recipient 변경 ──────────────────────────

    function setRecipient(address payable _newRecipient) external onlyOwner {
        require(_newRecipient != address(0), "PaymentReceiver: zero address");
        emit RecipientChanged(recipient, _newRecipient);
        recipient = _newRecipient;
        // owner만 수취인 주소를 변경할 수 있음.
    }

    // ── 조회 함수 ─────────────────────────────────────────────

    function getRecipient() external view returns (address) {
        return recipient;
        // 현재 ETH 수취인 주소 반환.
    }
}
