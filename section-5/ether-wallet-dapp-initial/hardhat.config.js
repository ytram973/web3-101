require("@nomicfoundation/hardhat-toolbox");

task(
  'accounts',
  'prints the list of accounts and their balances',
  async (taskArgs, hre)=>{
    const accounts = await hre.ethers.getSigners()

    for(const account of accounts){
      const balance = await account.getBalance()
      console.log(account.address, ":", balance )
    }
  }
)


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  paths: {
    sources: './contracts',
    artifacts: './src/artifacts'
  },
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      chainID: 1337
    },
    goerli: {
      url: 'https://goerli-testnet-node-url.com',
      // accounts: [privateKey1, privateKey2]
    }
  }
};
