// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// ─────────────────────────────────────────────────────────────
// MockERC20: 테스트용 ERC-20 토큰
//
// 용도:
//   로컬 Ganache 환경에서 USDC, DAI 등을 시뮬레이션
//   배포자가 mint()로 테스트 토큰을 임의 발행 가능
//
// 사용법:
//   new MockERC20("Mock USDC", "USDC", 6)   → 소수점 6자리
//   new MockERC20("Mock DAI",  "DAI",  18)  → 소수점 18자리
// ─────────────────────────────────────────────────────────────
contract MockERC20 {

    string  public name;
    string  public symbol;
    uint8   public decimals;
    uint256 public totalSupply;
    address public owner;

    mapping(address => uint256) public balanceOf;
    // 각 주소의 토큰 잔액

    mapping(address => mapping(address => uint256)) public allowance;
    // approve된 양: allowance[holder][spender]
    // PaymentReceiver가 transferFrom 하기 전에 approve 필요

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor(string memory _name, string memory _symbol, uint8 _decimals) {
        name     = _name;
        symbol   = _symbol;
        decimals = _decimals;
        owner    = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "MockERC20: not owner");
        _;
    }

    // 테스트 토큰 발행 (배포자 전용)
    function mint(address to, uint256 amount) external onlyOwner {
        balanceOf[to] += amount;
        totalSupply   += amount;
        emit Transfer(address(0), to, amount);
    }

    // 직접 전송
    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "MockERC20: insufficient balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to]         += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    // 제3자(spender)에게 사용 허가
    // PaymentReceiver가 사용자 토큰을 가져가기 전에 먼저 호출
    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    // approve된 금액만큼 spender가 from 토큰을 to로 이동
    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(balanceOf[from]             >= amount, "MockERC20: insufficient balance");
        require(allowance[from][msg.sender] >= amount, "MockERC20: insufficient allowance");
        allowance[from][msg.sender] -= amount;
        balanceOf[from]             -= amount;
        balanceOf[to]               += amount;
        emit Transfer(from, to, amount);
        return true;
    }
}
