// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ERC20.sol";

// ─────────────────────────────────────────────────────────────
// DualPayment: 이중 토큰 결제 컨트랙트
//
// 핵심 로직:
// 사용자가 pay() 함수를 호출하면:
//   1. GasToken에서 수수료를 자동으로 차감 (gasAmount)
//   2. PayToken으로 실제 결제금을 수신자에게 전달 (payAmount)
//
// 사용자 입장에서는 "결제" 버튼 하나만 누르면
// 두 토큰이 각자 역할에 맞게 자동으로 처리됨.
// ─────────────────────────────────────────────────────────────
contract DualPayment {

    // ── 상태 변수 ─────────────────────────────────────────────

    ERC20 public gasToken;
    // GasToken 컨트랙트의 주소를 저장. 수수료 차감에 사용.
    // ERC20 타입으로 선언하면 해당 주소의 컨트랙트 함수(transferFrom 등)를 직접 호출 가능.

    ERC20 public payToken;
    // PayToken 컨트랙트의 주소. 결제 금액 이동에 사용.

    address public feeCollector;
    // 수수료(GasToken)가 모이는 주소. 보통 서비스 운영자(우리).

    uint256 public feeRate;
    // 수수료율. 예: 5 = 결제금액의 5%를 GasToken으로 징수.
    // 실제 계산: gasAmount = payAmount * feeRate / 100

    // ── 이벤트 ───────────────────────────────────────────────

    event PaymentProcessed(
        address indexed payer,      // 결제한 사람
        address indexed recipient,  // 받는 사람
        uint256 payAmount,          // 결제된 PAY 토큰 양
        uint256 feeAmount           // 차감된 GAS 토큰 수수료
    );
    // 프론트엔드에서 이 이벤트를 감지해 "결제 완료!" 알림을 띄울 수 있음.

    // ── 생성자 ───────────────────────────────────────────────

    constructor(
        address _gasTokenAddress,  // 배포된 GasToken 컨트랙트 주소
        address _payTokenAddress,  // 배포된 PayToken 컨트랙트 주소
        address _feeCollector,     // 수수료 수취 주소 (배포자 본인)
        uint256 _feeRate           // 수수료율 (예: 5 → 5%)
    ) {
        gasToken     = ERC20(_gasTokenAddress);
        // address를 ERC20 컨트랙트 인터페이스로 캐스팅. 이제 gasToken.transferFrom() 호출 가능.
        payToken     = ERC20(_payTokenAddress);
        feeCollector = _feeCollector;
        feeRate      = _feeRate;
    }

    // ── 핵심 함수: 이중 토큰 결제 ────────────────────────────

    function pay(address recipient, uint256 payAmount) public {
        // recipient: 돈을 받는 사람
        // payAmount: 보낼 PAY 토큰 양 (소수점 포함 내부 단위, 즉 1 PAY = 1 * 10^18)

        // 1. GAS 수수료 계산
        uint256 feeAmount = (payAmount * feeRate) / 100;
        // 예: payAmount = 100 PAY, feeRate = 5 → feeAmount = 5 GAS

        // 2. 사용자 잔액 및 허가량 검증
        require(gasToken.balanceOf(msg.sender) >= feeAmount,
            "DualPayment: insufficient GAS for fee");
        // GasToken 잔액이 수수료보다 많아야 함

        require(payToken.balanceOf(msg.sender) >= payAmount,
            "DualPayment: insufficient PAY balance");
        // PayToken 잔액이 결제금액보다 많아야 함

        // 3. GasToken으로 수수료 징수
        // ★ 핵심: 이 함수가 호출되려면 사용자가 미리 gasToken.approve(this, feeAmount)를 해야 함!
        //         approve() = "이 컨트랙트가 내 GasToken을 feeAmount까지 가져가도 좋다" 허가
        bool gasSent = gasToken.transferFrom(msg.sender, feeCollector, feeAmount);
        require(gasSent, "DualPayment: GAS fee transfer failed");

        // 4. PayToken으로 실제 결제금 전송
        // 마찬가지로 payToken.approve(this, payAmount)가 미리 되어있어야 함.
        bool paySent = payToken.transferFrom(msg.sender, recipient, payAmount);
        require(paySent, "DualPayment: PAY transfer failed");

        // 5. 결제 완료 이벤트 발생 (프론트엔드에서 감지)
        emit PaymentProcessed(msg.sender, recipient, payAmount, feeAmount);
    }

    // ── 조회 함수 (view = 상태 변경 없음, 가스비 0) ──────────

    function getUserBalances(address user) public view returns (uint256 gasBalance, uint256 payBalance) {
        // 사용자의 두 토큰 잔액을 한 번에 반환.
        // "view" 함수는 블록체인 데이터를 읽기만 하므로 가스비가 없음.
        gasBalance = gasToken.balanceOf(user);
        payBalance = payToken.balanceOf(user);
    }
}
