// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./AggregatorV3Interface.sol";

/**
 * @title MockV3Aggregator
 * @notice 로컬 개발 환경용 가짜 Chainlink 가격 피드
 *
 * 실제 Chainlink 노드 없이도 latestRoundData()를 동일하게 사용할 수 있습니다.
 * 배포 시 초기 가격을 설정하고, updateAnswer()로 언제든 가격을 변경할 수 있습니다.
 *
 * 실제 사용법:
 *   - 배포: new MockV3Aggregator(8, 300000000000)  → 소수점 8자리, $3,000 설정
 *   - 가격 변경: mockFeed.updateAnswer(400000000000) → $4,000으로 변경
 */
contract MockV3Aggregator is AggregatorV3Interface {

    uint8 private _decimals;    // 소수점 자리수 (Chainlink ETH/USD = 8자리)
    int256 private _latestAnswer; // 현재 설정된 가격
    uint80 private _roundId;    // 라운드 카운터

    constructor(uint8 decimals_, int256 initialAnswer) {
        _decimals = decimals_;
        _latestAnswer = initialAnswer;
        _roundId = 1;
    }

    /**
     * @notice 가격 업데이트 (테스트 목적)
     */
    function updateAnswer(int256 newAnswer) external {
        _latestAnswer = newAnswer;
        _roundId++;
    }

    // ===== AggregatorV3Interface 구현 =====

    function decimals() external view override returns (uint8) {
        return _decimals;
    }

    function description() external pure override returns (string memory) {
        return "Mock Price Feed (Local Dev)";
    }

    function version() external pure override returns (uint256) {
        return 4; // Chainlink V3 버전과 동일
    }

    function latestRoundData()
        external
        view
        override
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        return (
            _roundId,
            _latestAnswer,
            block.timestamp,
            block.timestamp,
            _roundId
        );
    }
}
