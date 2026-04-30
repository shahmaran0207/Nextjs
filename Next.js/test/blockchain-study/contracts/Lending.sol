// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// 대출해 줄 토큰(예: 달러 코인 USDT, TokenA) 통신용 인터페이스
interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

// 체인링크 오라클 통신용 인터페이스
interface AggregatorV3Interface {
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

contract Lending {
    IERC20 public borrowToken; // 대출해 줄 코인 (1개 = 1달러로 취급)
    AggregatorV3Interface public priceOracle; // 담보(ETH) 가격 피드

    // LTV (Loan to Value): 담보 가치의 최대 70% 까지만 대출 가능
    uint256 public constant LTV_PERCENT = 70;
    
    // 청산 기준점 (Liquidation Threshold): 빌린 돈이 담보 가치의 80%를 넘어서면 위험 상태로 간주하여 강제 청산
    uint256 public constant LIQUIDATION_THRESHOLD = 80;

    // 유저들의 데이터 저장소
    mapping(address => uint256) public collateralETH; // 유저별 담보로 맡긴 ETH 수량 (wei)
    mapping(address => uint256) public borrowedToken; // 유저별 빌려간 코인 수량

    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    event Borrow(address indexed user, uint256 amount);
    event Repay(address indexed user, uint256 amount);
    event Liquidate(address indexed liquidator, address indexed user, uint256 debtRepaid, uint256 collateralLiquidated);

    constructor(address _borrowToken, address _oracle) {
        borrowToken = IERC20(_borrowToken);
        priceOracle = AggregatorV3Interface(_oracle);
    }

    // 1. 담보 예치 (ETH를 전당포에 맡김)
    function deposit() external payable {
        require(msg.value > 0, "Must deposit ETH");
        collateralETH[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    // 2. 오라클에서 현재 ETH의 1개당 가격(달러) 가져오기
    // (체인링크 가격 피드는 기본적으로 소수점 8자리를 가짐. 예: 2000 달러 -> 200000000000)
    function getLatestPrice() public view returns (uint256) {
        (, int256 price, , , ) = priceOracle.latestRoundData();
        require(price > 0, "Invalid Oracle Price");
        return uint256(price);
    }

    // 특정 유저가 맡긴 담보물(ETH)의 총 달러 가치를 계산
    function getCollateralValueInUSD(address user) public view returns (uint256) {
        uint256 ethAmount = collateralETH[user];
        uint256 price = getLatestPrice(); // 8 decimals

        // ETH는 18자리, 가격은 8자리이므로 계산 후 18자리로 나눠서 달러 가치(8자리)로 통일
        return (ethAmount * price) / 1e18;
    }

    // 3. 담보를 바탕으로 달러 코인 대출받기
    function borrow(uint256 borrowAmount) external {
        require(borrowAmount > 0, "Borrow amount must be > 0");
        
        // 현재 내 담보가 달러로 얼마인지 평가
        uint256 collateralValue = getCollateralValueInUSD(msg.sender);
        
        // 담보 가치의 70%를 대출 한도로 설정
        uint256 maxBorrowValue = (collateralValue * LTV_PERCENT) / 100;

        // 빌리려는 금액을 8자리 달러 가치로 변환 (빌리는 토큰이 18자리이므로 10^10으로 나눔)
        uint256 borrowValue = borrowAmount / 1e10;

        // 기존에 빌린 금액 변환
        uint256 currentBorrowedValue = borrowedToken[msg.sender] / 1e10;

        // (기존 빚 + 새로운 빚)이 한도를 초과하면 대출 거절
        require(currentBorrowedValue + borrowValue <= maxBorrowValue, "Borrow limit exceeded! Deposit more collateral.");

        borrowedToken[msg.sender] += borrowAmount;
        
        // 은행(컨트랙트)이 유저에게 코인을 전송
        require(borrowToken.transfer(msg.sender, borrowAmount), "Transfer failed");
        
        emit Borrow(msg.sender, borrowAmount);
    }

    // 4. 빌린 돈 갚기
    function repay(uint256 repayAmount) external {
        require(repayAmount > 0, "Repay amount must be > 0");
        require(borrowedToken[msg.sender] >= repayAmount, "Repaying more than borrowed");

        borrowedToken[msg.sender] -= repayAmount;
        
        // 유저가 은행(컨트랙트)으로 코인을 다시 보냄 (사전에 approve 필요)
        require(borrowToken.transferFrom(msg.sender, address(this), repayAmount), "Transfer failed. Check approval.");

        emit Repay(msg.sender, repayAmount);
    }

    // 담보 되찾아가기 (빚이 있으면 맘대로 못 가져감)
    function withdraw(uint256 withdrawAmount) external {
        require(collateralETH[msg.sender] >= withdrawAmount, "Not enough collateral");
        
        // 만약 이만큼 빼간다고 가정했을 때 남은 담보량
        uint256 remainingCollateral = collateralETH[msg.sender] - withdrawAmount;
        uint256 price = getLatestPrice();
        uint256 remainingCollateralValue = (remainingCollateral * price) / 1e18;
        
        // 남은 담보량 기준 대출 한도
        uint256 maxBorrowValue = (remainingCollateralValue * LTV_PERCENT) / 100;
        uint256 currentBorrowedValue = borrowedToken[msg.sender] / 1e10;

        // 담보를 뺐을 때 대출 한도가 빵꾸나면 출금 거절
        require(currentBorrowedValue <= maxBorrowValue, "Withdraw breaks collateral ratio! Repay debt first.");

        collateralETH[msg.sender] -= withdrawAmount;
        payable(msg.sender).transfer(withdrawAmount);

        emit Withdraw(msg.sender, withdrawAmount);
    }

    // 5. 💥 강제 청산 (Liquidation) 💥
    // 누군가의 담보(ETH) 가치가 폭락해서 빚(80%)을 감당하기 위험해질 때,
    // 누구든지(청산자) 이 함수를 호출해 대신 빚을 갚아주고, 유저의 담보(ETH)를 통째로 싸게 뺏어옵니다.
    function liquidate(address user) external {
        uint256 borrowed = borrowedToken[user];
        require(borrowed > 0, "User has no debt");

        uint256 collateralValue = getCollateralValueInUSD(user);
        uint256 borrowedValue = borrowed / 1e10;

        // 청산 기준점 (담보 가치의 80%) 계산
        uint256 liquidationThresholdValue = (collateralValue * LIQUIDATION_THRESHOLD) / 100;
        
        // 빚이 기준점보다 작으면 아직 안전한 상태이므로 청산 불가
        require(borrowedValue > liquidationThresholdValue, "User is safe, cannot liquidate");

        // 청산자가 유저의 빚을 전액 대신 갚음 (approve 필요)
        require(borrowToken.transferFrom(msg.sender, address(this), borrowed), "Repayment transfer failed");
        
        borrowedToken[user] = 0;

        // 빚을 대신 갚아준 대가로 유저의 담보물(ETH) 전체를 청산자가 몰수함
        // (실제 디파이에서는 빚을 갚은 만큼 + 5% 보너스만 주지만, 실습을 위해 통째로 압류)
        uint256 collateralToSeize = collateralETH[user];
        collateralETH[user] = 0;

        payable(msg.sender).transfer(collateralToSeize);

        emit Liquidate(msg.sender, user, borrowed, collateralToSeize);
    }
}
