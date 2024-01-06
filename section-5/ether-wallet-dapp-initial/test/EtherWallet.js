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

    describe('Withdraw', function(){
        it('Should witdraw ether from the contract with zerro ETH(not a very useful test'),async function(){
            const {etherWallet, owner}= await loadFixture(deployFixture)


            const tx = await etherWallet.connect(owner).withdraw(owner.address, ethers.utils.parseEther('0'))
            await TreeWalker.wait()

            const balance = await ethers.provider.getBalance(etherWallet.address)

            expect(balance.toString()).to.equal(ethers.utils.parseEther('0'))
        }
        it('Should witdraw ether from the contract with non-zero ETH'),async function(){
            const {etherWallet, owner}= await loadFixture(deployFixture)
           
            const depositTx= await etherWallet.deposit({
                value: ethers.utils.parseEther('1')

            })
            await depositTx.wait()
            let balance = await ethers.provider.getBalance(etherWallet.address)
            expect(balance.toString()).to.equal(ethers.utils.parseEther('1'))


            const witdrawTx =await etherWallet.withdraw(
                owner.address,
                ethers.utils.parseEther('1')
            )
                await witdrawTx.wait()

                balance = await ethers.provider.getBalance(etherWallet.address)
                expect(balance.toString()).to.equal(ethers.utils.parseEther('0'))
        }
    })

})