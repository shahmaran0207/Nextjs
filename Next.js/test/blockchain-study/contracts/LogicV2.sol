// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// [Logic V2: 버그가 패치되고 기능이 추가된 두 번째 두뇌]
contract LogicV2 {
    // ⚠️ V1과 변수 선언 순서가 100% 똑같아야 합니다. (Storage Collision 방지)
    address public implementation; 
    uint256 public value;

    // V1에 있던 함수 (그대로 유지)
    function setValue(uint256 _value) public {
        value = _value;
    }

    // 버전 확인 함수 업데이트
    function getVersion() public pure returns (string memory) {
        return "V2";
    }

    // ✨ V2에 새로 추가된 신규 기능!
    // 저장된 숫자를 파라미터만큼 곱해버리는 기능
    function multiply(uint256 _multiplier) public {
        value = value * _multiplier;
    }
}
