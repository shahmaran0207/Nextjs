// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title AggregatorV3Interface
 * @notice Chainlink 가격 피드 인터페이스 (원본: @chainlink/contracts)
 * npm 설치 없이 직접 복사하여 사용 — 실제 체인링크와 완전히 동일한 인터페이스
 */
interface AggregatorV3Interface {
    function decimals() external view returns (uint8);
    function description() external view returns (string memory);
    function version() external view returns (uint256);

    /**
     * @notice 최신 라운드(가장 최근 업데이트)의 가격 데이터를 반환
     * @return roundId     이번 라운드 ID
     * @return answer      가격 (decimals() 자리 소수점 포함 정수)
     * @return startedAt   라운드 시작 타임스탬프
     * @return updatedAt   마지막 업데이트 타임스탬프
     * @return answeredInRound 가격이 확정된 라운드 ID
     */
    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        );
}
