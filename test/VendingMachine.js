const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const Web3 = require("web3");
const web3 = new Web3();


describe('Vending Machine Contract satisfies the following tests: ', () => {
    
    /**
     *  @var { Object }  - (owner) To hold the address of the first test account provided by hardhat test network
     *  @var { Object } - (vendingMachine) The deployed vending machine smart contract instance
     *  @var { Object}  - (address1) To holds the address of the second test account provided by hardhat test network
     *  @var { Object}  - (address2) To holds the address of the third test account provided by hardhat test network
     *  @var {Object} - (cFactory) A factory for instances of vending machine contract
     */
    let owner, address1, address2, cFactory, vendingMachine;

    //Amount in wei(2 ether) to be used for deployment
    const DEFAULT_VALUE = web3.utils.toWei('2', 'ether');

    before(async () => {
        [ owner, address1, address2 ] = await ethers.getSigners();
    });

    before(async () => {
      cFactory =  await ethers.getContractFactory("VendingMachine", owner);
    });

    before(async () => {
       vendingMachine = await cFactory.deploy({
           value: DEFAULT_VALUE
       });
    });


    describe("deployed", () => {
        //Test for deployment of the contract
        it("should have deployed the contract", async () => {
            assert.exists(vendingMachine.address);
         });
    });

    
    describe("getReserveAmount", () => {
        //Test for default ether amount as reserve in the smart contract
        it("should have a default ether reserve balance in the contract", async () => {
           expect(await  vendingMachine.getReserveAmount()).to.be.equal(DEFAULT_VALUE);
        });
    });

    
    describe("deposit", () => {
        //Test to see if contract allows a user to deposit below minimum amount needed
        it("should revert if the deposit is below minimum", async () => {
           await expect(vendingMachine.deposit({value: web3.utils.toWei('0.01', 'ether')}))
                    .to.be.revertedWith("You must have at least 0.1 ether to initiate transaction");
        });

        //Test to see if it allows a user to deposit at least the minimum amount
        it("should deposit at least minimum amount to the contract", async () => {
            const amountToDepositByUser1 = web3.utils.toWei('0.8', 'ether');
            await vendingMachine.connect(address1).deposit({
                value: amountToDepositByUser1
            });

            expect(await vendingMachine.consumersDeposit(address1.address)).to.be.equal(amountToDepositByUser1);
        });

        //Test for multiple users deposit
        it("should allow multiple users to deposit at least minimum amount", async () => {
            const amountToDepositByUser2 = web3.utils.toWei('1', 'ether');
            await vendingMachine.connect(address2).deposit({
                value: amountToDepositByUser2
            });

            expect(await vendingMachine.consumersDeposit(address1.address)).to.be.equal(web3.utils.toWei('0.8', 'ether'));
            expect(await vendingMachine.consumersDeposit(address2.address)).to.be.equal(amountToDepositByUser2);
        });
    });


    describe("getPeanuts", () => {
        //Test to see if user can buy peanuts
        it("should buy peanuts", async () => {
            await  vendingMachine.connect(address1).getPeanuts(2);
           expect(await vendingMachine.peanuts(address1.address)).to.be.equal(2);
        });
    });


    describe("withdrawal", () => {
        //Test to see if user(address1) can withdraw any balance left
        it("should withdraw balance if any", async () => {
            //Balance remaining after address1 purchased 2 peanuts
            const balanceAfterPurchase = web3.utils.toWei('0.6', 'ether');                      
            expect(await vendingMachine.consumersDeposit(address1.address)).to.be.equal(balanceAfterPurchase);

            await  vendingMachine.connect(address1).withdrawal();
            expect(await vendingMachine.consumersDeposit(address1.address)).to.be.equal(0);
        });
    });


    describe("restockPeanuts", () => {
        //Test to see if it allows the owner of the contract to restock product
        it("should allow owner to restock peanuts", async () => {
            const initialStockValue = await vendingMachine.getPeanutsBalance(); 
            await vendingMachine.restockPeanuts(10);   
            const expectedStockValue = 10 + parseInt(initialStockValue);

            expect(await vendingMachine.getPeanutsBalance()).to.be.equal(expectedStockValue.toString());
        });

        //Test to see if it allows users other than the owner to restock product
        it("should revert if others except the owner tries restock peanuts", async () => {
            await expect(vendingMachine.connect(address1).restockPeanuts(20))
                    .to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    describe("hasNotBeenHacked", () => {
        //Test to see if contract has not been hacked
        it("should return true if the contract has not been hacked", async () => {
            expect(await vendingMachine.hasNotBeenHacked()).to.be.equal(true);
        });
    });
});
