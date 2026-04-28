// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// ERC20.sol에서 만든 기본 ERC-20을 상속(import)
// Solidity의 상속은 자바스크립트 class extends와 동일한 개념.
import "./ERC20.sol";

// ─────────────────────────────────────────────────────────────
// GasToken: 수수료(Gas Fee) 전용 토큰
// 이 토큰은 DualPayment 컨트랙트에서 "서비스 이용 수수료"로만 사용됨.
// 실제 자산 이동에는 쓰이지 않고 오직 수수료 역할만 함.
// ─────────────────────────────────────────────────────────────
contract GasToken is ERC20 {
    // "is ERC20" = ERC20 컨트랙트의 모든 기능(함수, 변수)을 상속받음.

    address public owner;
    // 컨트랙트 배포자(관리자) 주소. 새 토큰을 발행(mint)할 수 있는 권한.

    // modifier: 함수 실행 전 조건을 검사하는 재사용 가능한 코드 블록.
    // onlyOwner가 붙은 함수는 오직 owner 주소만 호출 가능.
    modifier onlyOwner() {
        require(msg.sender == owner, "GasToken: only owner");
        _; // 이 자리에 실제 함수 코드가 삽입됨
    }

    // 생성자: 배포 시 토큰 이름, 심볼, 초기 발행량을 ERC20 생성자에 전달
    constructor(uint256 initialSupply)
        ERC20("GasToken", "GAS", initialSupply)
        // "GasToken" = 토큰 이름, "GAS" = 심볼(티커), initialSupply = 초기 발행량
    {
        owner = msg.sender;
        // 배포자를 관리자로 등록
    }

    // mint: 관리자가 추가로 토큰을 발행하는 함수 (실제 서비스에서는 제한적으로 사용)
    // onlyOwner modifier 덕분에 관리자만 호출 가능
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount * (10 ** uint256(decimals)));
    }
}
