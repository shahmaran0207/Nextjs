// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// ─────────────────────────────────────────────────────────────────────────
// LandDAO: LandNFT 소유자들이 운영 정책을 직접 투표하는 DAO 컨트랙트
//
// 핵심 아이디어:
//   LandNFT를 보유한 사람 = 투표권 보유자
//   제안(Proposal) 등록 → 투표 기간 → 자동 실행
//
// 왜 스마트 컨트랙트로 만드나?
//   투표 결과를 서버가 처리하면 "서버가 결과를 바꿀 수도 있다"는 신뢰 문제가 생김.
//   컨트랙트가 처리하면 코드대로만 실행됨. 아무도 결과를 조작할 수 없음.
// ─────────────────────────────────────────────────────────────────────────

// LandNFT 컨트랙트의 인터페이스 (import 대신 필요한 함수만 선언)
// 이렇게 하면 LandNFT 주소만 알면 balanceOf를 호출할 수 있음.
interface ILandNFT {
    // 특정 주소가 보유한 NFT 개수 반환 (ERC-721 표준 함수)
    function balanceOf(address owner) external view returns (uint256);
    // 발행된 총 NFT 수 (우리가 LandNFT.sol에 추가한 함수)
    function totalMinted() external view returns (uint256);
}

contract LandDAO {

    // ── 연결된 LandNFT 컨트랙트 ────────────────────────────────────
    ILandNFT public landNFT;
    // LandNFT 주소를 ILandNFT 인터페이스로 감싸면
    // landNFT.balanceOf(주소) 같은 호출이 가능해짐.

    // ── 투표 설정값 ──────────────────────────────────────────────────
    uint256 public votingPeriod = 3 days;
    // 제안이 등록된 후 투표 가능한 시간. 기본 3일.
    // (Ganache 테스트에서는 짧게 줄여서 테스트 가능)

    uint256 public quorumPercent = 20;
    // 최소 정족수: 총 NFT 발행량의 20% 이상이 투표해야 유효.
    // 예: 총 10개 NFT 발행 → 2개 이상 지갑이 투표해야 실행 가능.

    // ── Proposal 구조체 ──────────────────────────────────────────────
    struct Proposal {
        uint256 id;             // 제안 번호 (1부터 시작)
        address proposer;       // 제안자 지갑 주소
        string  description;    // 제안 내용 설명 (예: "최대 가격 10 ETH 제한")
        uint256 votesFor;       // 찬성 투표 수 (NFT 개수 합계)
        uint256 votesAgainst;   // 반대 투표 수
        uint256 deadline;       // 투표 마감 시각 (block.timestamp + votingPeriod)
        bool    executed;       // 실행 완료 여부
        bool    passed;         // 통과 여부
    }

    // ── 상태 변수 ─────────────────────────────────────────────────────
    uint256 public proposalCount;
    // 지금까지 만들어진 제안 총 수. 새 제안의 id = ++proposalCount.

    mapping(uint256 => Proposal) public proposals;
    // proposalId => Proposal 구조체
    // mapping은 JS의 Map/Object와 비슷. 키로 값을 빠르게 조회.

    mapping(uint256 => mapping(address => bool)) public hasVoted;
    // proposalId => (투표자 주소 => 투표 여부)
    // 이중 투표 방지용. 한 주소는 한 제안에 한 번만 투표 가능.
    // "이중 mapping" = 2차원 배열처럼 동작.

    // ── 이벤트 ────────────────────────────────────────────────────────
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        string description,
        uint256 deadline
    );
    // 새 제안이 등록될 때 발생. 프론트엔드가 감지해 목록 갱신 가능.

    event Voted(
        uint256 indexed proposalId,
        address indexed voter,
        bool support,       // true = 찬성, false = 반대
        uint256 weight      // 투표권 수 (보유 NFT 개수)
    );

    event ProposalExecuted(
        uint256 indexed proposalId,
        bool passed         // 최종 통과 여부
    );

    // ── 생성자 ────────────────────────────────────────────────────────
    constructor(address _landNFTAddress) {
        // 배포 시 LandNFT 컨트랙트 주소를 받아서 저장.
        // 이렇게 연결해야 landNFT.balanceOf() 호출이 가능.
        landNFT = ILandNFT(_landNFTAddress);
    }

    // ── 제안 등록 ─────────────────────────────────────────────────────

    /**
     * @notice 새 정책 제안을 등록합니다.
     * @param description  제안 내용 (예: "구역 최대 가격을 10 ETH로 제한")
     *
     * LandNFT를 1개 이상 보유한 사람만 제안 가능.
     * 제안 자체는 설명 텍스트만 저장 (Simple DAO).
     * 고급 DAO에서는 실행할 함수 calldata도 저장해 자동 실행시킴.
     */
    function propose(string calldata description) external returns (uint256) {
        // msg.sender: 이 함수를 호출한 사람의 지갑 주소
        // LandNFT를 1개도 없으면 제안 불가
        require(
            landNFT.balanceOf(msg.sender) > 0,
            unicode"LandDAO: NFT 보유자만 제안할 수 있습니다"
        );

        uint256 proposalId = ++proposalCount;
        // 제안 번호를 1씩 증가시키며 부여.
        // ++proposalCount: 먼저 증가 후 값 반환 (1, 2, 3...)

        proposals[proposalId] = Proposal({
            id:           proposalId,
            proposer:     msg.sender,
            description:  description,
            votesFor:     0,
            votesAgainst: 0,
            deadline:     block.timestamp + votingPeriod,
            // block.timestamp: 현재 블록이 생성된 시각 (Unix timestamp, 초 단위)
            // 3 days = 259200초. Solidity는 시간 단위를 내장 지원.
            executed:     false,
            passed:       false
        });

        emit ProposalCreated(proposalId, msg.sender, description, proposals[proposalId].deadline);
        // emit: 이벤트를 블록체인에 기록. 트랜잭션 로그로 남음.
        // 서버/프론트에서 이 이벤트를 구독하면 실시간으로 감지 가능.

        return proposalId;
    }

    // ── 투표 ──────────────────────────────────────────────────────────

    /**
     * @notice 제안에 찬성 또는 반대 투표를 합니다.
     * @param proposalId  투표할 제안 번호
     * @param support     true = 찬성, false = 반대
     *
     * 투표권 = 현재 보유한 LandNFT 개수.
     * NFT 3개 보유 → 이 제안에 3표 행사.
     */
    function vote(uint256 proposalId, bool support) external {
        Proposal storage proposal = proposals[proposalId];
        // storage: 블록체인 저장소에서 직접 참조. 수정하면 실제 저장소가 바뀜.
        // memory: 함수 실행 중에만 존재하는 임시 복사본.

        require(proposal.id != 0,                     unicode"LandDAO: 존재하지 않는 제안");
        require(block.timestamp <= proposal.deadline,  unicode"LandDAO: 투표 기간이 종료됐습니다");
        require(!hasVoted[proposalId][msg.sender],    unicode"LandDAO: 이미 투표했습니다");

        uint256 weight = landNFT.balanceOf(msg.sender);
        // 투표 시점의 NFT 보유량으로 투표권 계산.
        // ★ 주의: 투표 후 NFT를 전달해도 이미 행사된 투표는 취소 안 됨.
        require(weight > 0, unicode"LandDAO: NFT가 없으면 투표할 수 없습니다");

        hasVoted[proposalId][msg.sender] = true;
        // 투표 완료 표시. 같은 주소로 다시 투표하면 위의 require에서 막힘.

        if (support) {
            proposal.votesFor += weight;
        } else {
            proposal.votesAgainst += weight;
        }

        emit Voted(proposalId, msg.sender, support, weight);
    }

    // ── 제안 실행 ─────────────────────────────────────────────────────

    /**
     * @notice 투표가 끝난 제안의 결과를 확정하고 기록합니다.
     * @param proposalId  실행할 제안 번호
     *
     * 누구나 호출 가능 (투표 마감 후).
     * 이 컨트랙트는 Simple DAO라 실제로 다른 함수를 자동 실행하지는 않고
     * 결과만 기록합니다. 고급 버전에서 자동 실행 추가 예정.
     */
    function execute(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];

        require(proposal.id != 0,               unicode"LandDAO: 존재하지 않는 제안");
        require(block.timestamp > proposal.deadline, unicode"LandDAO: 아직 투표 기간입니다");
        require(!proposal.executed,             unicode"LandDAO: 이미 실행됐습니다");

        proposal.executed = true;

        // ── 정족수 확인 ──────────────────────────────────────────────
        // 총 발행된 NFT 수 기준으로 quorumPercent% 이상 투표했는지 확인.
        uint256 totalNFTs   = landNFT.totalMinted();
        uint256 totalVotes  = proposal.votesFor + proposal.votesAgainst;

        // 정족수 계산: totalNFTs * quorumPercent / 100
        // 예: NFT 10개, quorum 20% → 2표 이상 투표해야 유효
        bool quorumReached = (totalNFTs > 0) &&
            (totalVotes * 100 >= totalNFTs * quorumPercent);

        // ── 통과 판정 ─────────────────────────────────────────────────
        // 정족수 충족 AND 찬성 > 반대
        proposal.passed = quorumReached && (proposal.votesFor > proposal.votesAgainst);

        emit ProposalExecuted(proposalId, proposal.passed);
    }

    // ── 조회 함수 ─────────────────────────────────────────────────────

    /**
     * @notice 제안의 현재 상태를 반환합니다.
     * view 함수: 블록체인 데이터를 읽기만 함 → 가스비 없음
     */
    function getProposal(uint256 proposalId) external view returns (
        address proposer,
        string memory description,
        uint256 votesFor,
        uint256 votesAgainst,
        uint256 deadline,
        bool executed,
        bool passed
    ) {
        Proposal storage p = proposals[proposalId];
        return (p.proposer, p.description, p.votesFor, p.votesAgainst,
                p.deadline, p.executed, p.passed);
    }

    /**
     * @notice 특정 주소의 투표 가능 여부와 투표권을 반환합니다.
     */
    function getVoterInfo(address voter, uint256 proposalId) external view returns (
        uint256 votingPower,  // 보유 NFT 수 = 투표권
        bool alreadyVoted     // 이미 투표했는지
    ) {
        return (
            landNFT.balanceOf(voter),
            hasVoted[proposalId][voter]
        );
    }

    // ── 관리자: 투표 기간 조정 (테스트용) ────────────────────────────
    address public admin;
    modifier onlyAdmin() {
        require(msg.sender == admin, unicode"LandDAO: 관리자만 가능");
        _;
    }

    // 생성자에서 admin 설정 추가 (위 constructor 수정)
    // 테스트용으로 votingPeriod를 짧게 설정 가능
    function setVotingPeriod(uint256 _seconds) external onlyAdmin {
        votingPeriod = _seconds;
        // Ganache 테스트 시: setVotingPeriod(60) → 1분으로 줄여서 빠른 테스트
    }

    function setAdmin(address _admin) external {
        // 최초 한 번만 설정 가능하도록 (admin이 없을 때만)
        require(admin == address(0), unicode"LandDAO: 이미 admin이 설정됐습니다");
        admin = _admin;
    }
}
