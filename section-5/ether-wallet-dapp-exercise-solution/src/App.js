import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import './App.css'
import EtherWallet from './artifacts/contracts/EtherWallet.sol/EtherWallet.json'

function App() {
  const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'

  // Metamask account handling
  const [account, setAccount] = useState('')
  const [balance, setBalance] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [shouldDisable, setShouldDisable] = useState(false) // Should disable connect button while connecting to MetaMask

  // EtherWallet Smart contract handling
  const [scBalance, scSetScBalance] = useState(0)
  const [ethToUseForDeposit, setEthToUseForDeposit] = useState(0)
  const [ethToUseForWithdrawal, setEthToUseForWithdrawal] = useState(0)
  const [ethAddrToUseForWithdrawal, setEthAddrToUseForWithdrawal] = useState(
    ethers.constants.AddressZero
  )

  useEffect(() => {
    // Get balance of the EtherWallet smart contract
    async function getEtherWalletBalance() {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const contract = new ethers.Contract(
          contractAddress,
          EtherWallet.abi,
          provider
        )
        let balance = await contract.balanceOf()
        // we use the code below to convert the balance from wei to eth
        balance = ethers.utils.formatEther(balance)
        scSetScBalance(balance)
      } catch (err) {
        console.log(
          'Error while connecting to EtherWallet smart contract: ',
          err
        )
      }
    }
    getEtherWalletBalance()
  }, [])

  // Connect to MetaMask wallet
  const connectToMetamask = async () => {
    console.log('Connecting to MetaMask...')
    setShouldDisable(true)
    try {
      // A Web3Provider wraps a standard Web3 provider, which is
      // what MetaMask injects as window.ethereum into each page
      const provider = new ethers.providers.Web3Provider(window.ethereum)

      // MetaMask requires requesting permission to connect users accounts
      await provider.send('eth_requestAccounts', [])

      // The MetaMask plugin also allows signing transactions to
      // send ether and pay to change state within the blockchain.
      // For this, you need the account signer...
      const signer = provider.getSigner()
      const account = await signer.getAddress()
      let balance = await signer.getBalance()
      // we use the code below to convert the balance from wei to eth
      balance = ethers.utils.formatEther(balance)
      setAccount(account)
      setBalance(balance)
      setIsActive(true)
      setShouldDisable(false)
    } catch (error) {
      console.log('Error while connecting to Metamask: ', error)
    }
  }

  // Disconnect from Metamask wallet
  const disconnectFromMetamask = async () => {
    console.log('Disconnecting wallet from App...')
    try {
      setAccount('')
      setBalance(0)
      setIsActive(false)
    } catch (error) {
      console.log('Error on disconnnect: ', error)
    }
  }


  
  // Deposit ETH to the EtherWallet smart contract
  const depositToEtherWalletContract = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner(account)
      const contract = new ethers.Contract(
        contractAddress,
        EtherWallet.abi,
        signer
      )

      const transaction = await contract.deposit({
        value: ethers.utils.parseEther(ethToUseForDeposit),
      })
      await transaction.wait()
      setEthToUseForDeposit(0)
      let balance = await signer.getBalance()
      balance = ethers.utils.formatEther(balance)
      setBalance(balance)

      let scBalance = await contract.balanceOf()
      scBalance = ethers.utils.formatEther(scBalance)
      scSetScBalance(scBalance)
    } catch (err) {
      console.log(
        'Error while depositing ETH to EtherWallet smart contract: ',
        err
      )
    }
  }

  // Withdraw ETH from the EtherWallet smart contract
  const withdrawFromEtherWalletContract = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner(account)
      const contract = new ethers.Contract(
        contractAddress,
        EtherWallet.abi,
        signer
      )

      const transaction = await contract.withdraw(
        ethAddrToUseForWithdrawal,
        ethers.utils.parseEther(ethToUseForWithdrawal)
      )
      await transaction.wait()
      setEthToUseForWithdrawal(0)
      setEthAddrToUseForWithdrawal(ethers.constants.AddressZero)

      let balance = await signer.getBalance()
      balance = ethers.utils.formatEther(balance)
      setBalance(balance)

      let scBalance = await contract.balanceOf()
      scBalance = ethers.utils.formatEther(scBalance)
      scSetScBalance(scBalance)
    } catch (err) {
      console.log(
        'Error while withdrawing ETH from EtherWallet smart contract: ',
        err
      )
    }
  }

  return (
    <div className='App'>
      <header className='App-header'>
        {!isActive ? (
          <>
            <Button
              variant='success'
              onClick={connectToMetamask}
              disabled={shouldDisable}
            >
              <img
                src='images/metamask.svg'
                alt='Metamask'
                width='50'
                height='50'
              />
              Connect to Metamask
            </Button>
          </>
        ) : (
          <>
            <Button variant='danger' onClick={disconnectFromMetamask}>
              <img
                src='images/metamask.svg'
                alt='Metamask'
                width='50'
                height='50'
              />
              Disconnect from Metamask
            </Button>
            <div>Connected Account: {account}</div>
            <div>Balance: {balance} ETH</div>
            <Form>
              <Form.Group className='mb-3' controlId='numberInEthDeposit'>
                <Form.Control
                  type='text'
                  placeholder='Enter the amount in ETH'
                  onChange={(e) => setEthToUseForDeposit(e.target.value)}
                />
                <Button
                  variant='primary'
                  onClick={depositToEtherWalletContract}
                >
                  Deposit to EtherWallet Smart Contract
                </Button>
              </Form.Group>
            </Form>
            <Form>
              <Form.Group className='mb-3' controlId='numberInEthWithdraw'>
                <Form.Control
                  type='text'
                  placeholder='Enter the amount in ETH'
                  onChange={(e) => setEthToUseForWithdrawal(e.target.value)}
                />
                <Form.Control
                  type='text'
                  placeholder='Enter the ETH address to withdraw to'
                  onChange={(e) => setEthAddrToUseForWithdrawal(e.target.value)}
                />
                <Button
                  variant='primary'
                  onClick={withdrawFromEtherWalletContract}
                >
                  Withdraw from EtherWallet Smart Contract
                </Button>
              </Form.Group>
            </Form>
          </>
        )}

        <div>EtherWallet Smart Contract Address: {contractAddress}</div>
        <div>EtherWallet Smart Contract Balance: {scBalance} ETH</div>
      </header>
    </div>
  )
}

export default App
