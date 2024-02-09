// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/* TODO: Use custom error type to define an error called "TxNotExists" that takes the argument "transactionIndex"
         This error will be thrown whenever the user tries to approve a transaction that does not exist.
*/
error TxNotExists(uint transactionIndex);
/* TODO: Use custom error type to define an error called "TxAlreadyApproved" that takes the argument "transactionIndex"
         This error will be thrown whenever the user tries to approve a transaction that has already been approved.
*/
error TxAlreadyApproved(uint transactionIndex);

/* TODO: Use custom error type to define an error called "TxAlreadySent" that takes the argument "transactionIndex"
         This error will be thrown whenever the user tries to approve a transaction that has already been sent.
*/
error TxAlreadySent(uint transactionIndex);

contract MultiSigWallet {
    event Deposit(uint amount, address indexed sender, uint balance);

    // TODO: Declare an event called "Deposit" that will be emitted whenever the smart contract receives some ETH
    /* TODO: Declare an event called "CreateWithdrawTx" that will be emitted whenever one of the owners tries to
             initiates a withdrawal of ETH from the smart contract
    */
    event CreateWithdrawTx(
        address indexed owner,
        uint indexed transactionIndex,
        address indexed to,
        uint amount
    );

    /* TODO: Declare an event called "ApproveWithdrawTx" that will be emitted whenever one of the owners tries to
             approve an existing withdrawal transaction
    */
    event ApproveWithdrawTx(
        address indexed owner,
        uint indexed transactionIndex
    );

    // TODO: Declare an array to keep track of owners
    address[] public owners;

    /* TODO: Declare a mapping called "isOwner" from address -> bool that will let us know whether a praticular address is one of the
             owners of the multisig smart contract wallet
    */
    mapping(address => bool) public isOwner;
    // TODO: Initialize an integer called "quorumRequired" to keep track of the total number of quorum required to approve a withdraw transaction
    uint public quorumRequired;

    /* TODO: Declare a struct called "WithdrawTx" that will be used to keep track of withdraw transaction that owners create. This
             struct will define four properties:
             1) Keep track of the receiver address called "to"
             2) Keep track of the amount of ETH to be withdrawn called "amount"
             3) Keep track of the current number of quorum reached called "approvals"
             4) Keep track of the status of the transaction whether it has been sent called "sent"
    */

    struct WithdrawTx {
        address to;
        uint amount;
        uint approvals;
        bool sent;
    }
    /* TODO: Declare a mapping called "isApproved" that will keep track of whether a particular withdraw transaction has
             already been approved by the current caller. This is a mapping from transaction index => owner => bool
    */
    mapping(uint => mapping(address => bool)) public isApproved;

    // TODO: Declare an array of WithdrawTxstruct to keep track of the list of withdrawal transactions for this multisig wallet
    WithdrawTx[] public withdrawTxes;

    constructor(address[] memory _owners, uint _quorumRequired) {
        require(_owners.length > 0, "owners required");
        require(
            _quorumRequired > 0 && _quorumRequired <= _owners.length,
            "invalid number of required quorum"
        );
        for (uint i = 0; i < _owners.length; i++) {
            address owner = _owners[i];
            require(owner != address(0), "invalid owner");
            require(!isOwner[owner], "owner not unique");

            isOwner[owner] = true;
            owners.push(owner);
        }
        quorumRequired = _quorumRequired;
    }

    function createWithdrawTx(address _to, uint _amount) public onlyOwner {
        uint transactionIndex = withdrawTxes.length;

        withdrawTxes.push(
            WithdrawTx({to: _to, amount: _amount, approvals: 0, sent: false})
        );
        emit CreateWithdrawTx(msg.sender, transactionIndex, _to, _amount);
    }

    function approveWithdrawTx(
        uint _transactionIndex
    )
        public
        onlyOwner
        transactionExists(_transactionIndex)
        transactionNotApproved(_transactionIndex)
        transactionNotSent(_transactionIndex)
    {
        WithdrawTx storage withdrawTx = withdrawTxes[_transactionIndex];
        withdrawTx.approvals += 1;
        isApproved[_transactionIndex][msg.sender] = true;

        if (withdrawTx.approvals >= quorumRequired) {
            withdrawTx.sent = true;
            (bool success, ) = withdrawTx.to.call{value: withdrawTx.amount}("");
            require(success, "transaction failed");
            emit ApproveWithdrawTx(msg.sender, _transactionIndex);
        }
    }

    function GetOwner() external view returns (address[] memory) {
        return owners;
    }

    function getWithdrawTxCount() public view returns (uint) {
        return withdrawTxes.length;
    }

    function getWithdrawTxes() public view returns (WithdrawTx[] memory) {
        return withdrawTxes;
    }

    function getWithdrawTx(
        uint _transactionIndex
    ) public view returns (address to, uint amount, uint approvals, bool sent) {
        WithdrawTx storage withdrawTx = withdrawTxes[_transactionIndex];
        return (
            withdrawTx.to,
            withdrawTx.amount,
            withdrawTx.approvals,
            withdrawTx.sent
        );
    }

    event Deposit(address indexed sender, uint amount, uint balance);

    function deposit() public payable {
        emit Deposit(msg.sender, msg.value, address(this).balance);
    }

    receive() external payable {
        emit Deposit(msg.sender, msg.value, address(this).balance);
    }

    modifier onlyOwner() {
        require(isOwner[msg.sender], "not owner");
        _;
    }

    // Declare a function modifier called "transactionExists" that ensures that transaction exists in the list of withdraw transactions
    modifier transactionExists(uint _transactionIndex) {
        require(_transactionIndex < withdrawTxes.length, "TxNotExists");
        _;
    }

    modifier transactionNotApproved(uint _transactionIndex) {
        if (isApproved[_transactionIndex][msg.sender]) {
            revert TxAlreadyApproved(_transactionIndex);
        }
        _;
    }

    modifier transactionNotSent(uint _transactionIndex) {
        if (withdrawTxes[_transactionIndex].sent) {
            revert TxAlreadySent(_transactionIndex);
        }
        _;
    }
}
