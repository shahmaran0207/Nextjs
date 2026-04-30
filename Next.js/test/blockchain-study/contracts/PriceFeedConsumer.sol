// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AggregatorV3Interface.sol";

/**
 * @title PriceFeedConsumer
 * @notice Chainlink Oracle을 통해 실시간 ETH/USD 가격을 읽는 컨트랙트
 *
 * 핵심 학습 포인트:
 *   - 스마트 컨트랙트는 직접 인터넷에 접근할 수 없음 (오라클 문제)
 *   - AggregatorV3Interface 주소만 넘기면 로컬(Mock)이든 실제(Chainlink)든 동일하게 작동
 *   - latestRoundData()로 가격 조회 → 8자리 소수점 → 실제 달러로 변환
 *
 * 환경별 주소:
 *   - 로컬 Ganache   : MockV3Aggregator를 직접 배포한 주소
 *   - Sepolia 테스트넷: 0x694AA1769357215DE4FAC081bf1f309aDC325306 (ETH/USD)
 *   - 이더리움 메인넷 : 0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419 (ETH/USD)
 */
contract PriceFeedConsumer {

    // Chainlink 가격 피드 컨트랙트 (로컬에서는 Mock, 실제는 Chainlink Aggregator)
    AggregatorV3Interface public priceFeed;

    // 마지막으로 조회한 가격 기록 (이벤트 로깅용)
    event PriceQueried(address indexed querier, int256 price, uint256 timestamp);

    constructor(address priceFeedAddress) {
        // 주소만 바꾸면 로컬 ↔ 테스트넷 ↔ 메인넷 전환 가능
        priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    /**
     * @notice 최신 ETH/USD 가격 조회
     * @return price 가격 (소수점 8자리 포함 정수. $3,000 → 300000000000)
     */
    function getLatestPrice() public view returns (int256 price) {
        // latestRoundData()는 5개 값 반환, 우리는 price(answer)만 필요
        (, price, , , ) = priceFeed.latestRoundData();
    }

    /**
     * @notice 사람이 읽기 쉬운 형태로 변환 (소수점 2자리 달러, wei 단위)
     * @return 달러 금액 × 1e18 (프론트엔드에서 ethers.formatEther로 읽으면 실제 달러)
     * 예시: $3,000 → 3000000000000000000000 (3000 * 1e18)
     */
    function getFormattedPrice() public view returns (uint256) {
        int256 rawPrice = getLatestPrice();
        require(rawPrice > 0, "Invalid price");

        // rawPrice는 8자리 소수점 → 달러로 변환 후 1e18 곱하기
        // rawPrice / 1e8 = 달러 금액
        // 달러 금액 * 1e18 = wei 단위 (ethers.formatEther로 읽을 수 있게)
        return uint256(rawPrice) * 1e10; // 1e8 나누고 1e18 곱하기 = 1e10 곱하기
    }

    /**
     * @notice 소수점 자리수 조회 (ETH/USD는 8자리)
     */
    function getDecimals() public view returns (uint8) {
        return priceFeed.decimals();
    }

    /**
     * @notice 가격 조회 + 이벤트 기록
     */
    function queryAndLog() external returns (int256) {
        int256 price = getLatestPrice();
        emit PriceQueried(msg.sender, price, block.timestamp);
        return price;
    }
}
