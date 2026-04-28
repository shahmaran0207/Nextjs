// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ERC20.sol";

// ─────────────────────────────────────────────────────────────
// PayToken: 실제 결제(자산 이동) 전용 토큰
// 사용자가 서비스 대금을 지불할 때 사용하는 토큰.
// GasToken과 구조는 거의 동일하지만 역할이 다름.
// (실제 서비스 예: USDT, USDC 같은 스테이블코인이 이 역할을 함)
// ─────────────────────────────────────────────────────────────
contract PayToken is ERC20 {

    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "PayToken: only owner");
        _;
    }

    constructor(uint256 initialSupply)
        ERC20("PayToken", "PAY", initialSupply)
        // "PayToken" = 이름, "PAY" = 심볼
    {
        owner = msg.sender;
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount * (10 ** uint256(decimals)));
    }
}
