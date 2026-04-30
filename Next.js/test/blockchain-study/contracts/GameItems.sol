// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GameItems is ERC1155, Ownable {
    // 각각의 아이템에 고유 ID(상수)를 부여합니다.
    uint256 public constant GOLD = 0;   // 재화 (대체 가능, 수량 무한대, ERC-20처럼 작동)
    uint256 public constant SWORD = 1;  // 고유 장비 (대체 불가능, 수량 1개, ERC-721처럼 작동)
    uint256 public constant SHIELD = 2; // 고유 장비
    uint256 public constant POTION = 3; // 소모품 (대체 가능)

    // 생성자: 아이템들의 메타데이터(이미지, 설명 등)가 있는 기본 주소를 설정합니다.
    // {id} 부분에 아이템의 번호가 들어가서 최종 URL이 완성됩니다.
    // 예: https://game.example/api/item/0.json (골드 메타데이터)
    constructor() ERC1155("https://game.example/api/item/{id}.json") Ownable() {
        
        // 블록체인에 배포되는 순간, 배포자(msg.sender)의 지갑에 초기 아이템을 강제로 지급(Mint)합니다.

        // 1. 단일 발행: _mint(받을사람, 토큰ID, 수량, 추가데이터)
        _mint(msg.sender, GOLD, 10000, "");   // 골드를 10,000개 발행
        _mint(msg.sender, POTION, 50, "");    // 포션을 50개 발행

        // 2. 일괄 발행 (배치 민팅)
        // ERC-721이었다면 각각 트랜잭션을 날려야 하지만, ERC-1155는 단 1번의 가스비로 처리됩니다.
        uint256[] memory ids = new uint256[](2);
        ids[0] = SWORD;
        ids[1] = SHIELD;

        uint256[] memory amounts = new uint256[](2);
        amounts[0] = 1; // 전설의 검 1개
        amounts[1] = 1; // 전설의 방패 1개

        _mintBatch(msg.sender, ids, amounts, "");
    }

    // 관리자(배포자)가 추가로 아이템을 더 찍어낼 수 있는 함수
    function mint(address account, uint256 id, uint256 amount) public onlyOwner {
        _mint(account, id, amount, "");
    }

    // 관리자가 한 번에 여러 종류의 아이템을 섞어서 찍어낼 수 있는 함수
    function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts) public onlyOwner {
        _mintBatch(to, ids, amounts, "");
    }
}
