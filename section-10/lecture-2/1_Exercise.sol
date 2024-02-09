// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

// TODO: Import Wallet.sol here
import "./Wallet.sol";
// TODO: Import ERC20 from Openzeppelin
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableMap.sol";

contract Staking is ERC20 {
    // TODO: Declare the events to be used in the 5 required functions
    event WalletCreate(uint256 walletid, address _address);
    event WalletDeposit(uint256 walletid, uint256 amount);
    event StakeEth(uint256 walletid, uint256 amount, uint startTime);
    event UnStakeEth(uint256 walletid, uint256 amount, uint numStocksReward);
    event WalletWithdraw(uint256 walletid, address _to, uint256 amount);

    // TODO: You can use a struct or mapping to keep track of all the current stakes in the staking pool.
    // Make sure to track the wallet, the total amount of ETH staked, the start time of the stake and the
    // end time of the stake

    using EnumerableMap for EnumerableMap.UintToAddressMap;

    struct StakeWallet {
        Wallet user;
        uint stakedAmount;
        uint sinceBlock;
        uint untilBlock;
    }

    // TODO: It may be a good idea to keep track of all the new stakes in an array

    StakeWallet[] private stakeWallets;

    EnumerableMap.UintToAddressMap private walletsStaked;

    // This defines the total percentage of reward(WEB3 ERC20 token) to be accumulated per second
    uint256 public constant percentPerBlock = 1; // Bonus Exercise: use more granular units

    // TODO: Define the constructor and make sure to define the ERC20 token here
    constructor() ERC20("DrakMatter", "DMT") {}

    // TODO: This should create a wallet for the user and return the wallet Id. The user can create as many wallets as they want
    function walletCreate() public returns (uint256 walletId) {
        Wallet wallet = new Wallet();
        stakeWallet.push(Stakewallet(wallet, 0, 0, 0));
        uint256 walletid = stakeWallets.length - 1;
        emit WalletCreate(walletId, address(wallet));
        return (walletid, address(wallet));
    }

    // TODO: This will return the array of wallets
    function getWallets() public view returns (StakeWallet[] memory) {
        return stakeWallets;
    }

    // TODO: This should let users deposit any amount of ETH into their wallet
    function walletDeposit(
        uint256 _walletId
    ) public payable isWalletOwner(_walletId) {
        StakeWallet storage stakeWallet = stakeWallets[_walletId];
        stakeWallet.user.deposit{value: msg.value}();
        emit WalletDeposit(_walletId, msg.value);
    }

    // TODO: This will return the current amount of ETH for a particular wallet
    function walletBalance(uint256 _walletId) public view returns (uint256) {
        StakeWallet memory stakeWallet = stakeWallets[_walletId];
        return stakeWallet.user.balanceOf();
    }

    // TODO: This should let users withdraw any amount of ETH from their wallet
    function walletWithdraw(
        uint256 _walletId,
        address payable _to,
        uint _amount
    ) public payable isWalletOwner(_walletId) {
        StakeWallet storage stakeWallet = stakeWallets[_walletId];
        stakeWallet.user.withdraw(_to, _amount);
        emit WalletWithdraw(_walletId, _to, _amount);
    }

    /*
      TODO: This should let users stake the current ETH they have in their wallet to the staking pool. The user should 
      be able to stake additional amount of ETH into the staking pool whereby doing so will first reward the users with 
      the accumulated WEB3 ERC20 token and then reset the timestamp for the overall stake. When you stake your ETH into 
      the pool, what happens is the ETH is withdrawn from the wallet to the staking pool so make sure to call the withdraw 
      function of the wallet here to handle this.
    */
    // Bonus Exercise: Let user stake any amount of ETH rather than the whole balance
    function stakeEth(uint256 _walletId) public isWalletOwner(_walletId) {
        // TODO: Ensure that the wallet balance is non-zero before staking
        // TODO: Transfer ETH from the wallet(Wallet contract) to the staking pool(this contract)
        // TODO: Reward with WEB3 tokens that the user had accumulated previously
        StakeWallet storage stakeWallet = stakeWallets[_walletId];
        uint256 currentBalance = stakeWallet.user.balanceOf();
        require(currentBalance > 0, "Wallet balance needs to be non-zero");

        stakeWallet.user.withdraw(payable(address(this)), currentBalance);

        uint256 stakedForBlocks = (block.timestamp - stakeWallet.sinceBlock);
        uint256 totalUnclaimedRewards = (stakeWallet.stakedAmount *
            stakedForBlocks *
            percentPerBlock) / 100;
        _mint(msg.sender, totalUnclaimedRewards);

        stakeWallet.stakedAmount += currentBalance;
        stakeWallet.sinceBlock = block.timestamp;
        stakeWallet.untilBlock = 0;

        walletsStaked.set(_walletId, address(stakeWallet.user));

        emit StakeEth(_walletId, currentBalance, block.timestamp);
    }

    // TODO: This will return the current amount of ETH that a particular wallet has staked in the staking pool
    function currentStake(uint256 _walletId) public view returns (uint256) {
        StakeWallet storage stakeWallet = stakeWallets[_walletId];
        return stakeWallet.stakedAmount;
    }

    // TODO: This will return the total unclaimed WEB3 ERC20 tokens based on the user’s stake in the staking pool
    function currentReward(uint256 _walletId) public view returns (uint256) {
        StakeWallet storage stakeWallet = stakeWallets[_walletId];
        uint256 stakedForBlocks = (block.timestamp - stakeWallet.sinceBlock);
        uint256 totalUnclaimedRewards = (stakeWallet.stakedAmount *
            stakedForBlocks *
            percentPerBlock) / 100;

        return totalUnclaimedRewards;
    }

    // TODO: This will return the total amount of wallets that are currently in the staking pool
    function totalAddressesStaked() public view returns (uint256) {
        return walletsStaked.length();
    }

    // TODO: This will return true or false depending on whether a particular wallet is staked in the staking pool
    function isWalletStaked(uint256 _walletId) public view returns (bool) {
        return walletsStaked.contains(_walletId);
    }

    /*
      TODO: This should let users unstake all their ETH they have in the staking pool. Doing so will automatically mint 
      the appropriate amount of WEB3 ERC20 tokens that have been accumulated so far. When you unstake your ETH from the pool, 
      the ETH is withdrawn from the staking pool to the user wallet so make sure to call the transfer function to handle this.
    */
    function unstakeEth(
        uint256 _walletId
    ) public payable isWalletOwner(_walletId) {
        // TODO: Ensure that the user hasn't already unstaked previously
        // TODO: Transfer ETHB from the staking pool(this contract) to the wallet(Wallet contract)
        // TODO: Reward with WEB3 tokens that the user had accumulated so far
        StakeWallet storage stakeWallet = stakeWallets[_walletId];
        require(stakeWallet.untilBlock == 0, "Already unstaked");

        uint256 currentBalance = stakeWallet.stakedAmount;
        payable(address(stakeWallet.user)).transder(currentBalance);

        uint256 rewardAmount = currentReward(_walletId);
        _mint(msg.sender, rewardAmount);

        stakeWallet.untilBlock = block.timestamp;
        stakeWallet.sinceBlock = 0;
        stakeWallet.stakedAmount = 0;

        walletsStaked.remove(_walletId);
        emit UnStakeEth(_walletId, stakeWallet.stakedAmount, rewardAmount);
    }

    // TODO: Implement the "receive()" fallback function so the contract can handle the deposit of ETH
    receive() external payable {}

    // TODO: Implement the modifier "isWalletOwner" that checks whether msg.sender is the owner of the wallet
    modifier isWalletOwner(uint256 walletId) {
        require(msg.sender != address(0), "invalid owner");
        StakeWallet memory stakeWallet = stakeWallets[walletId];
        require(
            msg.sender ==  stakeWallet.user.owner(),
            "Not the woner of the wallet"
        );
        _;
    }
}
