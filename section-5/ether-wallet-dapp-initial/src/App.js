import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form'
import './App.css';
import metamaskLogo from './asset/metamask.svg';
import hand from './asset/hand.svg';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import EtherWallet from "./artifacts/contracts/EtherWallet.sol/EtherWallet.json";



function App() {
  const contractAddress="0x5fbdb2315678afecb367f032d93f642f64180aa3"

  //Metamask handling
  const [account, setAccount] = useState('')
  const [balance, setBalance] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [shouldDisable, setShouldDisable] = useState(false)

  //EtherWallet Smart contract handling
  const [scBalance, setScBalance]= useState(0)
  const [ethToUseDeposit, setEthToUseForDeposit]= useState(0)

  useEffect(()=>{

    async function getEtherWalletBalance()  {
      try{
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const contract = new ethers.Contract(
          contractAddress,
          EtherWallet.abi,
          provider
          )
          let balance= await contract.balanceOf()
          balance= ethers.utils.formatEther(balance)
          console.log("sc balancce:",balance);
          setScBalance(balance)
        }catch(err){
          console.log("error while connecting to etherWallet smart contract:",err);
        }
      }
      getEtherWalletBalance()
    },[])
      

  //Connection to Metamask wallet
  const ConnectToMetamask = async () => {
    console.log("Connecting to MetaMask...");

    setShouldDisable(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);

      const signer = provider.getSigner();
      const account = await signer.getAddress();
      let balance = await signer.getBalance();

      balance = ethers.utils.formatEther(balance);
      console.log("account", account);
      console.log("balance", balance);
      setAccount(account);
      setBalance(balance);
      setIsActive(true);
    } catch (error) {
      console.log('Error on connecting:', error);
    } finally {
      setShouldDisable(false);
    }
  };


  const disconnectFromMetamask = async()=>{
    console.log("Disconnecting wallet from app ...");
    try{
      setAccount('')
      setBalance(0)
      setIsActive(false)
    }catch(error){
      console.log("Error on disconnect: ",error);
    }
  }

const depositToEtherWalletContract = async()=>{
  try{

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner(account)
  const contract =new ethers.Contract(
    contractAddress,
    EtherWallet.abi,
    signer
  )
    const transaction = await contract.deposit({
      value: ethers.utils.parseEther(ethToUseDeposit)
    })
    await transaction.wait()

    let balance = await signer.getBalance()
    balance= ethers.utils.formatEther(balance)
    setBalance(balance)

    let scBalance = await signer.getBalance()
    scBalance= ethers.utils.formatEther(scBalance)
    setScBalance(scBalance)
  }catch(err){
    console.log("erro while depositing ETH to EtherWallet smart contract:", err);
  }


}


  return (
    <div className="App">
      <header className="App-header">
        {!isActive ? (
          <>
          <Button variant="secondary" onClick={ConnectToMetamask} disabled={shouldDisable}>
          <img src={metamaskLogo} alt='metamask' width="80" height="80" />Connect to metamask
        </Button>
          </>
        ) : (
          <>
          <Button variant="danger" onClick={disconnectFromMetamask}>
          Disconnect Metamask{''}
          <img src={hand} width="50" height="50" alt='disconnect' />
        </Button>
        <div className='mt2 mb-2'>Connect Account: {account}</div>
        <div className='mt2 mb-2'>Balance: {balance}</div>
        <Form>
          <Form.Group className="mb-3" controlId="numberInEth">
            <Form.Control 
            type="text"
            placeholder='Enter the amount in ETH'
            onChange={(e)=> setEthToUseForDeposit(e.target.value)}/>
            <Button variant="primary" onClick={depositToEtherWalletContract}>
              Deposit to EtherWallet Smart Contract
            </Button>
          </Form.Group>
        </Form>
        
          </>
        )}

        
       <div>EtherWallet smart Contract Address{contractAddress}</div>
       <div>EtherWallet smart Contract Address{scBalance}</div>
      </header>
    </div>
  );
}

export default App;
