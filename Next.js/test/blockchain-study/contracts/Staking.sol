// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Staking {
    // ========== 스테이킹 토큰 (예치 대상 코인) ==========
    IERC20 public stakingToken;

    // ========== Phase 3: 이자 로직 상태 변수 ==========

    // 이자율: 1초마다 전체 예치자에게 총 몇 개의 RWD를 돌릴 것인가? (= 파이 크기)
    // 1 ether = 1 RWD/초 → 10초 예치 시 10 RWD 이자 발생 (테스트용 고속 이자)
    uint256 public rewardRate = 1 ether;

    // 마지막으로 전광판을 업데이트한 타임스탬프
    uint256 public lastUpdateTime;

    // 현재까지 1 코인당 누적된 이자율 (전광판 숫자, 1e18 스케일)
    uint256 public rewardPerTokenStored;

    // 장부: 하나하나 누가 얼마를 예치했는가
    mapping(address => uint256) public stakingBalance;

    // 수첩: 유저가 마지막으로 확인한 시점의 전광판 숫자 (개인 수첩)
    mapping(address => uint256) public userRewardPerTokenPaid;

    // 실제로 쿠쿠 쌓인 이자 잔액 (아직 오지 않은 이자송)
    mapping(address => uint256) public rewards;

    // 은행 금고에 들어있는 전체 예치금 총합
    uint256 public totalSupply;

    // ========== 생성자 ==========
    constructor(address _stakingToken) {
        stakingToken = IERC20(_stakingToken);
        lastUpdateTime = block.timestamp;
    }

    // ========== 전광판 수식 (Phase 3 핵심) ==========

    /**
     * @notice 현재 시점에서 1 코인당 누적 이자율을 계산 (= 전광판 숫자)
     */
    function rewardPerToken() public view returns (uint256) {
        if (totalSupply == 0) {
            // 예치자가 없으면 전광판은 자리에 멈춰 있음
            return rewardPerTokenStored;
        }
        return rewardPerTokenStored +
            (rewardRate * (block.timestamp - lastUpdateTime) * 1e18) / totalSupply;
        //  (초당 파이) × (지난 초) / (전체 예치송) = 이 기간동안 1코인당 추가된 이자율
    }

    /**
     * @notice 특정 유저가 지금까지 벌은 이자 계산
     * = (지금 전광판 - 내 수첩에 적힌 수첩) × 내 예치금 + 이미 쌓인 이자
     */
    function earned(address account) public view returns (uint256) {
        return (
            (stakingBalance[account] * (rewardPerToken() - userRewardPerTokenPaid[account])) / 1e18
        ) + rewards[account];
    }

    // ========== 상태 업데이트 모디파이어 (= 전광판 동기화) ==========
    // 예치/인출/이자수령 함수를 호출할 때마다 자동으로 실행되는 선행 업데이트
    modifier updateReward(address account) {
        // 1. 전광판 숫자 갱신
        rewardPerTokenStored = rewardPerToken();
        // 2. 마지막 업데이트 시간 갱신
        lastUpdateTime = block.timestamp;

        if (account != address(0)) {
            // 3. 이 사람이 지금까지 벌은 이자를 rewards에 저장
            rewards[account] = earned(account);
            // 4. 수첩에 현재 전광판 숫자 기록 (= 수첩 업데이트)
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _; // 이제 진짜 함수 실행
    }

    // ========== 주요 함수들 ==========

    /**
     * @notice 돈을 예치하는 함수
     */
    function stake(uint256 amount) external updateReward(msg.sender) {
        require(amount > 0, "Amount must be greater than 0");

        totalSupply += amount;
        stakingBalance[msg.sender] += amount;

        // 유저 지갑 → 은행 금고로 코인 이동
        bool success = stakingToken.transferFrom(msg.sender, address(this), amount);
        require(success, "Transfer failed");
    }

    /**
     * @notice 예치금을 인출하는 함수
     */
    function withdraw(uint256 amount) external updateReward(msg.sender) {
        require(amount > 0, "Amount must be greater than 0");
        require(stakingBalance[msg.sender] >= amount, "Not enough staked balance");

        totalSupply -= amount;
        stakingBalance[msg.sender] -= amount;

        // 은행 금고 → 유저 지갑으로 코인 반환
        bool success = stakingToken.transfer(msg.sender, amount);
        require(success, "Transfer failed");
    }

    /**
     * @notice 쌓인 이자를 내 지갑으로 가져가는 함수
     */
    function getReward() external updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];
        require(reward > 0, "No reward to claim");

        // 이자 장부 마이너스 (이중수령 방지)
        rewards[msg.sender] = 0;

        // 이자를 유저 지갑으로 송금
        // (중요: 이 컨트랙트가 충분한 RWD를 보유하고 있어야 함!)
        bool success = stakingToken.transfer(msg.sender, reward);
        require(success, "Reward transfer failed");
    }
}
