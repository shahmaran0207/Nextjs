// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// ─────────────────────────────────────────────────────────────
// EscrowReceiver: 멀티코인 에스크로(안전결제) 스마트 컨트랙트
//
// 역할: 구매자의 자금을 즉시 판매자에게 보내지 않고,
//       컨트랙트(금고) 내부에 안전하게 보관(Lock)합니다.
//       이후 백엔드(오라클)가 배송 완료를 확인하면,
//       자금을 판매자에게 해제(Release)합니다.
// ─────────────────────────────────────────────────────────────

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
}

contract PaymentReceiver {

    address public owner;

    // 에스크로 주문 상태 정의
    enum EscrowStatus { None, Locked, Released, Refunded }

    // 에스크로 주문 구조체
    struct EscrowOrder {
        address payer;
        address recipient;
        address tokenAddress; // Native ETH일 경우 address(0)
        uint256 amount;
        EscrowStatus status;
    }

    // 주문번호(orderId) -> 에스크로 정보 매핑
    mapping(string => EscrowOrder) public escrows;

    // 이벤트 정의
    event FundsLocked(
        string orderId,
        address indexed payer,
        address indexed recipient,
        address tokenAddress,
        uint256 amount
    );

    event FundsReleased(
        string orderId,
        address indexed recipient,
        uint256 amount
    );

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Escrow: not owner");
        _;
    }

    // ── 1. ETH 결제 (Lock) ─────────────────────────
    function pay(
        string calldata orderId,
        address recipient
    ) external payable {
        require(msg.value > 0, "Escrow: amount must be > 0");
        require(recipient != address(0), "Escrow: zero recipient");
        require(escrows[orderId].status == EscrowStatus.None, "Escrow: order already exists");

        // 상태 기록 (돈은 이미 payable로 컨트랙트에 들어와 있음)
        escrows[orderId] = EscrowOrder({
            payer: msg.sender,
            recipient: recipient,
            tokenAddress: address(0),
            amount: msg.value,
            status: EscrowStatus.Locked
        });

        emit FundsLocked(orderId, msg.sender, recipient, address(0), msg.value);
    }

    // ── 2. ERC-20 결제 (Lock) ───────────────────────────
    function payERC20(
        string calldata orderId,
        address recipient,
        address tokenAddress,
        uint256 amount
    ) external {
        require(amount > 0, "Escrow: amount must be > 0");
        require(recipient != address(0), "Escrow: zero recipient");
        require(tokenAddress != address(0), "Escrow: zero token");
        require(escrows[orderId].status == EscrowStatus.None, "Escrow: order already exists");

        // 사용자(msg.sender) → 컨트랙트(address(this))로 토큰 보관
        bool sent = IERC20(tokenAddress).transferFrom(msg.sender, address(this), amount);
        require(sent, "Escrow: ERC20 lock failed");

        // 상태 기록
        escrows[orderId] = EscrowOrder({
            payer: msg.sender,
            recipient: recipient,
            tokenAddress: tokenAddress,
            amount: amount,
            status: EscrowStatus.Locked
        });

        emit FundsLocked(orderId, msg.sender, recipient, tokenAddress, amount);
    }

    // ── 3. 자금 해제 (Release) - 오직 관리자(오라클)만 호출 가능 ──
    function releaseFunds(string calldata orderId) external onlyOwner {
        EscrowOrder storage order = escrows[orderId];
        require(order.status == EscrowStatus.Locked, "Escrow: funds are not locked");

        order.status = EscrowStatus.Released;

        if (order.tokenAddress == address(0)) {
            // ETH 전송
            (bool sent, ) = order.recipient.call{value: order.amount}("");
            require(sent, "Escrow: ETH release failed");
        } else {
            // ERC-20 전송
            bool sent = IERC20(order.tokenAddress).transfer(order.recipient, order.amount);
            require(sent, "Escrow: ERC20 release failed");
        }

        emit FundsReleased(orderId, order.recipient, order.amount);
    }

    function getOwner() external view returns (address) {
        return owner;
    }
}
