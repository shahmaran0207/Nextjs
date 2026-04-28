// SPDX-License-Identifier: MIT
// 라이선스 표기 (MIT = 누구나 사용 가능). 없으면 컴파일 경고 발생.

pragma solidity ^0.8.20;
// Solidity 버전 지정. ^0.8.20 = 0.8.20 이상 0.9.0 미만 버전에서 컴파일 가능.

// ─────────────────────────────────────────────────────────────
// ERC-20 표준이란?
// 이더리움에서 "대체 가능한 토큰(Fungible Token)"을 만들기 위한 규약(인터페이스).
// 모든 ERC-20 토큰은 아래 함수들을 반드시 가져야 한다는 약속.
// (우리가 만드는 GAS 토큰, PAY 토큰 모두 이 규약을 따름)
// ─────────────────────────────────────────────────────────────
contract ERC20 {

    // ── 상태 변수 (블록체인에 영구 저장되는 데이터) ──────────

    string public name;       // 토큰 이름 (예: "GasToken")
    string public symbol;     // 토큰 심볼 (예: "GAS")
    uint8  public decimals = 18;
    // decimals = 소수점 자리수. 이더리움의 표준은 18.
    // 즉, 사람이 "1 토큰"이라고 부르는 것은 내부적으로 1 * 10^18 (1000000000000000000) 으로 저장됨.
    // 정수만 다루는 블록체인에서 소수점을 표현하는 방법.

    uint256 public totalSupply;
    // 이 토큰의 총 발행량. 발행(mint)하면 늘어나고, 소각(burn)하면 줄어든다.

    mapping(address => uint256) public balanceOf;
    // "mapping" = 자바스크립트의 Map 또는 객체(Object)와 같음.
    // address(지갑 주소) → uint256(잔액) 로 연결해 모든 계정의 잔액을 저장.
    // 예: balanceOf[0xABC...] = 1000 (0xABC 주소가 1000 토큰 보유)

    mapping(address => mapping(address => uint256)) public allowance;
    // 이중 mapping. "A가 B에게 최대 얼마까지 대신 출금해도 된다"는 허가량(Allowance).
    // 예: allowance[내지갑][컨트랙트주소] = 500 → 컨트랙트가 내 지갑에서 최대 500 출금 가능.
    // ERC-20 결제에서 핵심! 컨트랙트가 내 토큰을 쓰려면 반드시 먼저 approve() 해야 함.

    // ── 이벤트 (블록체인 로그에 기록되는 알림) ───────────────
    // 프론트엔드(ethers.js)에서 이 이벤트를 구독(listen)해서 전송 완료를 알 수 있음.

    event Transfer(address indexed from, address indexed to, uint256 value);
    // 토큰이 이동될 때마다 발생. from=보낸사람, to=받는사람, value=금액.

    event Approval(address indexed owner, address indexed spender, uint256 value);
    // 허가(approve)가 설정될 때 발생.

    // ── 생성자 (컨트랙트 배포 시 단 1번만 실행) ──────────────
    constructor(string memory _name, string memory _symbol, uint256 _initialSupply) {
        name   = _name;
        symbol = _symbol;
        // _initialSupply * 10^18 계산: 사람이 입력한 숫자를 내부 단위로 변환
        _mint(msg.sender, _initialSupply * (10 ** uint256(decimals)));
        // msg.sender = 이 컨트랙트를 배포한 사람의 지갑 주소.
        // 배포자에게 초기 발행량 전부를 지급.
    }

    // ── 핵심 함수들 ───────────────────────────────────────────

    // transfer: 내 지갑에서 to 주소로 amount만큼 토큰을 직접 전송
    function transfer(address to, uint256 amount) public returns (bool) {
        require(balanceOf[msg.sender] >= amount, "GAS: insufficient balance");
        // require = 조건이 false면 트랜잭션 전체를 되돌리고(revert) 에러 메시지 출력.
        // "잔액이 amount 이상이어야만 통과"
        _transfer(msg.sender, to, amount);
        return true;
    }

    // approve: spender(보통 컨트랙트 주소)가 내 토큰을 amount만큼 대신 쓰도록 허가
    // DualPayment 컨트랙트가 내 GasToken을 가져가려면 반드시 먼저 이 함수를 호출해야 함!
    function approve(address spender, uint256 amount) public returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    // transferFrom: 허가받은 spender가 owner의 토큰을 대신 전송
    // DualPayment 컨트랙트 내부에서 이 함수를 호출해 수수료와 결제를 처리함.
    function transferFrom(address from, address to, uint256 amount) public returns (bool) {
        require(allowance[from][msg.sender] >= amount, "GAS: insufficient allowance");
        // msg.sender(컨트랙트)에게 허가된 양이 충분한지 확인
        allowance[from][msg.sender] -= amount; // 허가량 차감
        _transfer(from, to, amount);
        return true;
    }

    // ── 내부 함수 (external에서 직접 호출 불가, 컨트랙트 내부에서만 사용) ──

    function _transfer(address from, address to, uint256 amount) internal {
        require(to != address(0), "transfer to zero address"); // 0x000...000 주소로는 전송 불가 (소각 방지)
        balanceOf[from] -= amount;
        balanceOf[to]   += amount;
        emit Transfer(from, to, amount);
    }

    function _mint(address to, uint256 amount) internal {
        totalSupply      += amount; // 총 발행량 증가
        balanceOf[to]    += amount; // 받는 사람 잔액 증가
        emit Transfer(address(0), to, amount); // 관례적으로 0주소→to로 Transfer 이벤트 발생
    }
}
