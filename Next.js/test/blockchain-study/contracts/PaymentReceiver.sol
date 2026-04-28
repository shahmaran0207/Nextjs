// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// ─────────────────────────────────────────────────────────────
// PaymentReceiver: 멀티코인 + 멀티 판매자 결제 수신 컨트랙트
//
// 지원 결제:
//   1. ETH (네이티브)
//      pay(orderId, recipient)  — msg.value로 ETH 전달
//
//   2. ERC-20 토큰 (USDC, DAI 등)
//      payERC20(orderId, recipient, tokenAddress, amount)
//      사전 조건: token.approve(PaymentReceiver주소, amount) 필요
//
// 3개 체인(A/B/C)에 각각 동일하게 배포됨.
// ─────────────────────────────────────────────────────────────

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

contract PaymentReceiver {

    address public owner;

    // ETH 결제 이벤트
    event PaymentReceived(
        address indexed payer,
        uint256         amount,
        string          orderId,
        address indexed recipient
    );

    // ERC-20 결제 이벤트
    event ERC20PaymentReceived(
        address indexed payer,
        address indexed recipient,
        string          orderId,
        address         tokenAddress,
        uint256         amount
    );

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "PaymentReceiver: not owner");
        _;
    }

    // ── ETH 결제: 판매자에게 즉시 포워딩 ─────────────────────────
    function pay(
        string  calldata orderId,
        address payable  recipient
    ) external payable {
        require(msg.value > 0,           "PaymentReceiver: amount must be > 0");
        require(recipient != address(0), "PaymentReceiver: zero recipient");

        (bool sent, ) = recipient.call{value: msg.value}("");
        require(sent, "PaymentReceiver: ETH forward failed");

        emit PaymentReceived(msg.sender, msg.value, orderId, recipient);
    }

    // ── ERC-20 결제: approve 후 판매자에게 transferFrom ───────────
    // 호출 전 반드시: token.approve(address(this), amount)
    function payERC20(
        string   calldata orderId,
        address  payable  recipient,
        address           tokenAddress,
        uint256           amount
    ) external {
        require(amount > 0,              "PaymentReceiver: amount must be > 0");
        require(recipient != address(0), "PaymentReceiver: zero recipient");
        require(tokenAddress != address(0), "PaymentReceiver: zero token");

        // 사용자(msg.sender) → 판매자(recipient)로 토큰 직접 이동
        // 컨트랙트에 토큰을 보관하지 않음
        bool sent = IERC20(tokenAddress).transferFrom(msg.sender, recipient, amount);
        require(sent, "PaymentReceiver: ERC20 transfer failed");

        emit ERC20PaymentReceived(msg.sender, recipient, orderId, tokenAddress, amount);
    }

    function getOwner() external view returns (address) {
        return owner;
    }
}
