// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MultiSigWallet {
    // 이벤트 선언 (프론트엔드에 알림을 주기 위함)
    event Deposit(address indexed sender, uint amount, uint balance);
    event SubmitTransaction(
        address indexed owner,
        uint indexed txIndex,
        address indexed to,
        uint value,
        bytes data
    );
    event ConfirmTransaction(address indexed owner, uint indexed txIndex);
    event RevokeConfirmation(address indexed owner, uint indexed txIndex);
    event ExecuteTransaction(address indexed owner, uint indexed txIndex);

    // 지갑 공동 소유자들
    address[] public owners;
    mapping(address => bool) public isOwner;
    
    // 필수 서명 개수 (예: 3명 중 2명)
    uint public numConfirmationsRequired;

    // 송금 기안(Transaction) 구조체
    struct Transaction {
        address to;            // 받을 사람
        uint value;            // 보낼 금액(wei)
        bytes data;            // 컨트랙트 실행 데이터 (일반 송금일 땐 비워둠)
        bool executed;         // 송금 실행 완료 여부
        uint numConfirmations; // 현재까지 모인 결재 도장 개수
    }

    // 송금 기안 목록 (장부)
    Transaction[] public transactions;

    // 누가 어떤 기안에 도장을 찍었는지 기록 (중복 결재 방지)
    // txIndex => owner => bool
    mapping(uint => mapping(address => bool)) public isConfirmed;

    // 권한 검사용 Modifier
    modifier onlyOwner() {
        require(isOwner[msg.sender], "Not an owner");
        _;
    }

    modifier txExists(uint _txIndex) {
        require(_txIndex < transactions.length, "Tx does not exist");
        _;
    }

    modifier notExecuted(uint _txIndex) {
        require(!transactions[_txIndex].executed, "Tx already executed");
        _;
    }

    modifier notConfirmed(uint _txIndex) {
        require(!isConfirmed[_txIndex][msg.sender], "Tx already confirmed by you");
        _;
    }

    // 0. 생성자: 처음 금고를 만들 때 소유자들과 필수 결재 수를 정합니다.
    constructor(address[] memory _owners, uint _numConfirmationsRequired) {
        require(_owners.length > 0, "Owners required");
        require(
            _numConfirmationsRequired > 0 && _numConfirmationsRequired <= _owners.length,
            "Invalid required confirmations"
        );

        for (uint i = 0; i < _owners.length; i++) {
            address owner = _owners[i];
            require(owner != address(0), "Invalid owner");
            require(!isOwner[owner], "Owner must be unique");

            isOwner[owner] = true;
            owners.push(owner);
        }

        numConfirmationsRequired = _numConfirmationsRequired;
    }

    // 금고에 누가 입금하면 이 함수가 자동으로 돈을 받아 보관합니다.
    receive() external payable {
        emit Deposit(msg.sender, msg.value, address(this).balance);
    }

    // 1. 송금 기안 올리기 (누구에게 얼마를 보낼지 작성)
    function submitTransaction(address _to, uint _value, bytes memory _data) public onlyOwner {
        uint txIndex = transactions.length;

        transactions.push(
            Transaction({
                to: _to,
                value: _value,
                data: _data,
                executed: false,
                numConfirmations: 0
            })
        );

        emit SubmitTransaction(msg.sender, txIndex, _to, _value, _data);
    }

    // 2. 결재 도장 찍기
    function confirmTransaction(uint _txIndex)
        public
        onlyOwner
        txExists(_txIndex)
        notExecuted(_txIndex)
        notConfirmed(_txIndex)
    {
        Transaction storage transaction = transactions[_txIndex];
        
        transaction.numConfirmations += 1;
        isConfirmed[_txIndex][msg.sender] = true;

        emit ConfirmTransaction(msg.sender, _txIndex);
    }

    // 3. 실제 송금 실행하기 (도장이 기준치만큼 모여야만 실행됨)
    function executeTransaction(uint _txIndex)
        public
        onlyOwner
        txExists(_txIndex)
        notExecuted(_txIndex)
    {
        Transaction storage transaction = transactions[_txIndex];

        // 핵심 보안: 필수 결재 수 충족 검사
        require(transaction.numConfirmations >= numConfirmationsRequired, "Not enough confirmations");

        transaction.executed = true; // 먹튀 방지를 위해 송금 전 상태 변경 (CEI 패턴)

        (bool success, ) = transaction.to.call{value: transaction.value}(transaction.data);
        require(success, "Transaction failed");

        emit ExecuteTransaction(msg.sender, _txIndex);
    }

    // 4. 결재 도장 취소하기 (마음이 바뀌었을 때)
    function revokeConfirmation(uint _txIndex)
        public
        onlyOwner
        txExists(_txIndex)
        notExecuted(_txIndex)
    {
        Transaction storage transaction = transactions[_txIndex];

        require(isConfirmed[_txIndex][msg.sender], "Tx not confirmed by you");

        transaction.numConfirmations -= 1;
        isConfirmed[_txIndex][msg.sender] = false;

        emit RevokeConfirmation(msg.sender, _txIndex);
    }

    function getOwners() public view returns (address[] memory) {
        return owners;
    }

    function getTransactionCount() public view returns (uint) {
        return transactions.length;
    }

    // 트랜잭션 정보 조회 (프론트엔드 연동용)
    function getTransaction(uint _txIndex)
        public
        view
        returns (
            address to,
            uint value,
            bytes memory data,
            bool executed,
            uint numConfirmations
        )
    {
        Transaction storage transaction = transactions[_txIndex];
        return (
            transaction.to,
            transaction.value,
            transaction.data,
            transaction.executed,
            transaction.numConfirmations
        );
    }
}
