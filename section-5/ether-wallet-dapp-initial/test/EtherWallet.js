const {loadFixture}= require('@nomicfoundation/hardhat-network-helpers')
const {expect} = require('chai')
const {ethers}= require('hardhat')


describe('EtherWallet', function(){
    
    async function deployFixture(){
        const [owner, otherAccount] = await ethers.getSigners()

        const EtherWallet = await ethers.getContractFactory('EtherWallet')
        const etherWallet = await EtherWallet.deploy()

        return{etherWallet, owner, otherAccount}
    }


    describe('Deployment', function(){
        it('Should deploy and set the owner to be the deployer address',async function(){
            const {etherWallet,owner}= await loadFixture(deployFixture);

            expect(await etherWallet.owner ()).to.equal(owner.address)
        })
    })

    
    describe('Deposit', function(){
        it('should deposit Ether to the contract', async function(){
            const {etherWallet}= await loadFixture(deployFixture)

            const tx = await etherWallet.deposit({
                value: ethers.utils.parseEther('1')
            })
            await tx.wait()

            const balance = await ethers.provider.getBalance(etherWallet.address)
            expect(balance.toString()).to.equal(ethers.utils.parseEther('1'))
        })


    })

    describe('balanceOf', function () {
        it('Should return the current balance of the contract', async function () {
          const { etherWallet } = await loadFixture(deployFixture);
          const depositAmount = ethers.utils.parseEther('1');
      
          // Déposer de l'Ether dans le contrat
          const depositTx = await etherWallet.deposit({ value: depositAmount });
          await depositTx.wait();
      
          // Vérifier le solde du contrat
          const balance = await etherWallet.balanceOf();
          expect(balance.toString()).to.equal(depositAmount.toString());
        });
      });
      

      describe('withdraw', function () {
        it('Should revert the transaction if called by someone other than the owner', async function () {
          const { etherWallet, otherAccount } = await loadFixture(deployFixture);
          const withdrawAmount = ethers.utils.parseEther('1');
      
          // Essayer de retirer de l'Ether avec un compte autre que le propriétaire
          await expect(
            etherWallet.connect(otherAccount).withdraw(otherAccount.address, withdrawAmount)
          ).to.be.revertedWith('Only owner can withdraw');
        });
      
        it('Should allow the owner to withdraw Ether', async function () {
          const { etherWallet, owner } = await loadFixture(deployFixture);
          const depositAmount = ethers.utils.parseEther('1');
          const withdrawAmount = ethers.utils.parseEther('1');
      
          // Déposer de l'Ether dans le contrat
          const depositTx = await etherWallet.deposit({ value: depositAmount });
          await depositTx.wait();
      
          // Retirer de l'Ether avec le propriétaire
          const initialBalance = await ethers.provider.getBalance(owner.address);
          const withdrawTx = await etherWallet.connect(owner).withdraw(owner.address, withdrawAmount);
          await withdrawTx.wait();
          const finalBalance = await ethers.provider.getBalance(owner.address);
      
          // Vérifier que le solde du propriétaire a augmenté
          expect(finalBalance.sub(initialBalance)).to.be.closeTo(withdrawAmount, ethers.utils.parseEther('0.01'));
        });
      });
      

})