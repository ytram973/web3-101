import { ConnectButton } from '@rainbow-me/rainbowkit'

import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import { useContract, useContractRead, useSigner } from 'wagmi'
import EtherWallet from './artifacts/contracts/EtherWallet.sol/EtherWallet.json'
import { useAccount } from 'wagmi';

function App() {
  const contractAddress = '0xe5d5907BFa7D2cde8940a2c2Dc81C33759cE6Ce7'

  // EtherWallet Smart contract handling
  const [scBalance, scSetScBalance] = useState(0)
  const [ethToUseForDeposit, setEthToUseForDeposit] = useState(0)

  const { data: contractBalance } = useContractRead({
    addressOrName: contractAddress,
    contractInterface: EtherWallet.abi,
    functionName: 'balanceOf',
    watch: true,
  })
  useEffect(() => {
    if (contractBalance) {
      let temp = contractBalance / 10 ** 18
      scSetScBalance(temp)
    }
  }, [contractBalance])

  const { data: signer } = useSigner()
  const depositETH = useContract({
    addressOrName: contractAddress,
    contractInterface: EtherWallet.abi,
    signerOrProvider: signer,
  })
  // Deposit ETH to the EtherWallet smart contract
  const depositToEtherWalletContract = async () => {
    await depositETH.deposit({
      value: ethers.utils.parseEther(ethToUseForDeposit),
    })
  }

  const { address } = useAccount();

  const withdrawFromEtherWalletContract = async () => {
    if (!signer) return;
    try {
      // Retirer tout le solde du contrat
      const balance = await depositETH.balanceOf();
      const tx = await depositETH.withdraw(address, balance);
      await tx.wait();
      alert('Withdrawal successful!');
    } catch (error) {
      console.error(error);
      alert('Error during withdrawal');
    }
  };
  

  return (
    <div className='container flex flex-col  items-center mt-10'>
      <div className='flex mb-6'>
        <ConnectButton />
      </div>
      <h3 className='text-5xl font-bold mb-20'>
        {'Deposit to EtherWallet Smart Contract'}
      </h3>

      <Form>
        <Form.Group className='mb-3' controlId='numberInEth'>
          <Form.Control
            type='text'
            placeholder='Enter the amount in ETH'
            onChange={(e) => setEthToUseForDeposit(e.target.value)}
          />
          
          <Button variant='primary' onClick={depositToEtherWalletContract}>
            Deposit
          </Button>
          <Button variant='primary' onClick={withdrawFromEtherWalletContract}>
            Withdraw
          </Button>
        </Form.Group>
      </Form>

      <div>EtherWallet Smart Contract Address: {contractAddress}</div>
      <div>EtherWallet Smart Contract Balance: {scBalance} ETH</div>
    </div>
  )
}

export default App
