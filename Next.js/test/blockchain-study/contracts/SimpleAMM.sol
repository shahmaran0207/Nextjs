// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title SimpleAMM
 * @notice x × y = k 공식 기반 탈중앙 거래소 (DEX) 풀
 *
 * 핵심 원리:
 *   풀에 두 토큰(tokenA = RWD, tokenB = TKA)을 보관하면서
 *   x × y = k 공식이 항상 성립하도록 교환 비율을 자동 계산합니다.
 *
 * 흐름:
 *   1. addLiquidity() → 두 토큰을 풀에 넣어 "개업"
 *   2. swapAforB()    → RWD를 넣고 TKA를 받음
 *   3. swapBforA()    → TKA를 넣고 RWD를 받음
 */
contract SimpleAMM {

    // ========== 상태 변수 ==========

    // 교환할 두 토큰 컨트랙트 주소 (배포 시 고정)
    IERC20 public tokenA; // RWD
    IERC20 public tokenB; // TKA

    // 현재 풀 내 보유량 (x, y)
    uint256 public reserveA; // 풀 내 RWD 수량
    uint256 public reserveB; // 풀 내 TKA 수량

    // ========== 이벤트 ==========

    // 유동성 공급 시 기록
    event LiquidityAdded(address indexed provider, uint256 amountA, uint256 amountB);
    // 교환 시 기록
    event Swapped(address indexed user, address tokenIn, uint256 amountIn, uint256 amountOut);

    // ========== 생성자 ==========

    constructor(address _tokenA, address _tokenB) {
        tokenA = IERC20(_tokenA);
        tokenB = IERC20(_tokenB);
    }

    // ========== 핵심 함수 ==========

    /**
     * @notice 풀에 두 토큰을 동시에 예치 (유동성 공급 / 개업)
     * @param amountA 넣을 RWD 수량
     * @param amountB 넣을 TKA 수량
     *
     * 주의: 호출 전에 두 토큰 모두 approve(AMM주소, 금액) 해야 함
     */
    function addLiquidity(uint256 amountA, uint256 amountB) external {
        require(amountA > 0 && amountB > 0, "amounts must be > 0");

        // 사용자 지갑 → 이 컨트랙트(금고)로 두 토큰 동시 이동
        tokenA.transferFrom(msg.sender, address(this), amountA);
        tokenB.transferFrom(msg.sender, address(this), amountB);

        // 풀 보유량 업데이트
        reserveA += amountA;
        reserveB += amountB;

        emit LiquidityAdded(msg.sender, amountA, amountB);
    }

    /**
     * @notice x × y = k 공식으로 교환 수령량 계산 (수수료 없는 순수 계산)
     * @param amountIn  넣는 토큰 수량
     * @param reserveIn 넣는 토큰의 현재 풀 보유량
     * @param reserveOut 받는 토큰의 현재 풀 보유량
     * @return amountOut 받을 수 있는 토큰 수량
     *
     * 수식 유도:
     *   기존 k = reserveIn × reserveOut
     *   새로운 reserveIn = reserveIn + amountIn
     *   새로운 reserveOut = k ÷ (reserveIn + amountIn)
     *   amountOut = reserveOut - 새로운 reserveOut
     *             = reserveOut × amountIn ÷ (reserveIn + amountIn)
     */
    function getAmountOut(
        uint256 amountIn,
        uint256 reserveIn,
        uint256 reserveOut
    ) public pure returns (uint256 amountOut) {
        require(amountIn > 0, "amountIn must be > 0");
        require(reserveIn > 0 && reserveOut > 0, "pool is empty");

        // amountOut = (reserveOut × amountIn) / (reserveIn + amountIn)
        amountOut = (reserveOut * amountIn) / (reserveIn + amountIn);
    }

    /**
     * @notice RWD(tokenA)를 넣고 TKA(tokenB)를 받는 교환
     * @param amountIn     넣을 RWD 수량
     * @param minAmountOut 최소 수령 TKA 수량 (슬리피지 보호: 이 이하면 거래 취소)
     */
    function swapAforB(uint256 amountIn, uint256 minAmountOut) external {
        // 받을 수량 계산
        uint256 amountOut = getAmountOut(amountIn, reserveA, reserveB);

        // 슬리피지 보호: 기대치보다 너무 적으면 취소
        require(amountOut >= minAmountOut, "slippage: insufficient output");

        // RWD: 사용자 → 풀
        tokenA.transferFrom(msg.sender, address(this), amountIn);
        // TKA: 풀 → 사용자
        tokenB.transfer(msg.sender, amountOut);

        // 풀 보유량 업데이트
        reserveA += amountIn;
        reserveB -= amountOut;

        emit Swapped(msg.sender, address(tokenA), amountIn, amountOut);
    }

    /**
     * @notice TKA(tokenB)를 넣고 RWD(tokenA)를 받는 교환
     * @param amountIn     넣을 TKA 수량
     * @param minAmountOut 최소 수령 RWD 수량 (슬리피지 보호)
     */
    function swapBforA(uint256 amountIn, uint256 minAmountOut) external {
        uint256 amountOut = getAmountOut(amountIn, reserveB, reserveA);
        require(amountOut >= minAmountOut, "slippage: insufficient output");

        // TKA: 사용자 → 풀
        tokenB.transferFrom(msg.sender, address(this), amountIn);
        // RWD: 풀 → 사용자
        tokenA.transfer(msg.sender, amountOut);

        reserveB += amountIn;
        reserveA -= amountOut;

        emit Swapped(msg.sender, address(tokenB), amountIn, amountOut);
    }

    /**
     * @notice 현재 풀 상태 조회 (프론트엔드 표시용)
     */
    function getReserves() external view returns (uint256 _reserveA, uint256 _reserveB) {
        return (reserveA, reserveB);
    }

    /**
     * @notice 현재 환율 계산: TKA 1개당 RWD 몇 개? (표시 전용, 소수점 18자리)
     *   priceA = reserveA × 1e18 / reserveB  → formatEther로 읽으면 됨
     */
    function getPriceAinB() external view returns (uint256) {
        if (reserveB == 0) return 0;
        return (reserveA * 1e18) / reserveB;
    }
}
