// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// [Proxy: 유저가 100년 동안 변함없이 접속할 단 하나의 몸통(금고)]
contract SimpleProxy {
    // ⚠️ 저장 공간(Storage) 설계
    // V1, V2와 순서가 완벽히 같아야 합니다.
    address public implementation; // 현재 참조하고 있는 머리(Logic)의 주소
    uint256 public value;          // 유저들의 데이터가 저장될 공간

    // 배포할 때, 처음으로 사용할 머리(V1)의 주소를 세팅합니다.
    constructor(address _initialLogic) {
        implementation = _initialLogic;
    }

    // 🔄 업그레이드 함수: 머리를 교체합니다! (V1 -> V2)
    function upgradeTo(address _newLogic) public {
        implementation = _newLogic;
    }

    // ✨ 프록시의 진짜 마법: Fallback 함수
    // 누군가 Proxy에게 없는 함수(예: setValue, multiply)를 호출하면 무조건 여기로 빠집니다.
    fallback() external payable {
        // 1. 현재 내 머리(Implementation)가 어디 있는지 찾는다.
        address _impl = implementation;
        require(_impl != address(0), "Logic address not set");

        // 2. 어셈블리(Assembly)를 사용해 머리의 코드를 내 몸통으로 가져와서 대리 실행(delegatecall)한다.
        assembly {
            // 유저가 보낸 데이터(어떤 함수를 실행할지 등)를 복사
            calldatacopy(0, 0, calldatasize())

            // delegatecall 실행! (가스비, 실행할주소, 입력데이터시작, 입력데이터길이, 결과저장시작, 결과저장길이)
            // 성공하면 1, 실패하면 0 반환
            let result := delegatecall(gas(), _impl, 0, calldatasize(), 0, 0)

            // 실행 결과(리턴값)를 복사
            returndatacopy(0, 0, returndatasize())

            // 실행 성공 여부에 따라 결과를 반환하거나 에러를 냄
            switch result
            case 0 { revert(0, returndatasize()) }
            default { return(0, returndatasize()) }
        }
    }

    // 이더리움을 받을 수 있게 열어둠
    receive() external payable {}
}
