// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// [Logic V1: 첫 번째 두뇌]
// 단순히 숫자 하나를 저장하고 조회하는 기능만 있습니다.
contract LogicV1 {
    // ⚠️ 매우 중요: 프록시(몸통)와 로직(두뇌)의 변수 순서는 무조건 똑같아야 합니다!
    // 프록시 컨트랙트에서 첫 번째 변수가 implementation(주소)이므로, 
    // 로직 컨트랙트도 무조건 첫 번째 변수 자리를 비워두거나 같은 타입으로 맞춰야 합니다.
    address public implementation; 
    
    // 진짜 우리가 쓸 데이터
    uint256 public value;

    // 변수에 숫자를 저장하는 함수
    function setValue(uint256 _value) public {
        value = _value;
    }

    // 현재 버전이 뭔지 확인하기 위한 함수
    function getVersion() public pure returns (string memory) {
        return "V1";
    }
}
