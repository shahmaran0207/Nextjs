// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TokenA
 * @notice DEX 교환 실습용 두 번째 ERC-20 토큰
 * RWD(RewardToken)과 이 토큰을 교환하는 AMM DEX를 만들 것입니다.
 */
contract TokenA is ERC20, Ownable {
    // 총 발행 한도: 1,000,000 TKA (하드캡 설정 — 무한 발행 방지)
    uint256 public constant MAX_SUPPLY = 1_000_000 * 1e18;

    constructor() ERC20("Token Alpha", "TKA") Ownable() {
        // 배포자에게 초기 500,000 TKA 발행
        // → 나머지 500,000개는 나중에 유동성 공급 등에 사용
        _mint(msg.sender, 500_000 * 1e18);
    }

    /**
     * @notice 추가 발행 (owner만 가능, MAX_SUPPLY 초과 불가)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "MAX_SUPPLY exceeded");
        _mint(to, amount);
    }

    /**
     * @notice 테스트용 Faucet: 누구나 1,000 TKA 무료 획득
     */
    function faucet() external {
        require(totalSupply() + 1_000 * 1e18 <= MAX_SUPPLY, "Supply cap reached");
        _mint(msg.sender, 1_000 * 1e18);
    }
}
