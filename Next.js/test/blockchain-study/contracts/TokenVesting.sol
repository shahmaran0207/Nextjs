// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// 일반적인 ERC-20 토큰과 통신하기 위한 인터페이스
interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract TokenVesting {
    IERC20 public token;
    address public beneficiary; // 토큰을 수령할 사람 (개발팀 또는 투자자)

    uint256 public start;       // 잠금 시작 시간 (Timestamp)
    uint256 public cliff;       // 절벽 끝나는 시간 (이때까진 1개도 못 뺌)
    uint256 public duration;    // 총 잠금 기간 (절벽을 포함한 전체 분배 기간)
    
    uint256 public released;    // 지금까지 클레임(인출)해간 토큰 누적 수량

    event TokensReleased(address beneficiary, uint256 amount);

    constructor(
        address _token,
        address _beneficiary,
        uint256 _start,
        uint256 _cliffDuration,
        uint256 _duration
    ) {
        require(_beneficiary != address(0), "Beneficiary is zero address");
        require(_cliffDuration <= _duration, "Cliff duration cannot exceed total duration");

        token = IERC20(_token);
        beneficiary = _beneficiary;
        
        start = _start;
        cliff = _start + _cliffDuration; // 절벽 끝나는 지점
        duration = _duration;            // 전체 기간
    }

    // 💰 시간이 지나 락업이 풀린 토큰을 유저(팀)가 수령해가는 함수
    function release() public {
        // 현재 수령 가능한 수량 계산
        uint256 unreleased = releasableAmount();
        require(unreleased > 0, "No tokens are ready to be released yet");

        // 누적 수령량 업데이트
        released += unreleased;
        
        // 실제 토큰 전송
        require(token.transfer(beneficiary, unreleased), "Token transfer failed");

        emit TokensReleased(beneficiary, unreleased);
    }

    // 📊 현재 시점에서 바로 출금 가능한 토큰 개수 반환
    function releasableAmount() public view returns (uint256) {
        return vestedAmount() - released;
    }

    // 📊 전체 물량 중, 현재 시간 기준으로 락업이 해제된 총 누적 토큰 개수 반환 (핵심 로직)
    function vestedAmount() public view returns (uint256) {
        // 현재 이 금고가 가진 잔액
        uint256 currentBalance = token.balanceOf(address(this));
        
        // 이 금고에 배정되었던 원래의 '총 물량' (현재 잔액 + 이미 빼간 금액)
        uint256 totalBalance = currentBalance + released;

        // 1. 아직 절벽(Cliff) 기간을 못 넘겼다면: 0개 풀림
        if (block.timestamp < cliff) {
            return 0;
        } 
        // 2. 전체 기간(Duration)이 다 끝났다면: 100% 다 풀림
        else if (block.timestamp >= start + duration) {
            return totalBalance;
        } 
        // 3. 절벽은 지났고, 전체 기간 사이라면: 시간 비율(%)에 맞춰 선형적으로 풀림
        else {
            return (totalBalance * (block.timestamp - start)) / duration;
        }
    }
}
