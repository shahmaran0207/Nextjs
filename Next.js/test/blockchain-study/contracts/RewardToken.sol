// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract RewardToken is ERC20 {
    // Faucet으로 한 번에 지급할 토큰 양 (100개)
    // decimals가 18이므로 100 * 10^18 로 설정해야 합니다.
    uint256 public constant FAUCET_AMOUNT = 100 * 10**18;

    constructor() ERC20("Reward Token", "RWD") {
        // 배포될 때 배포자(Admin)에게 초기 자금으로 100만 개 발행
        _mint(msg.sender, 1000000 * 10**18);
    }

    /**
     * @notice 누구나 호출하여 100 RWD 토큰을 무료로 받을 수 있는 함수
     */
    function faucet() external {
        _mint(msg.sender, FAUCET_AMOUNT);
    }
}
