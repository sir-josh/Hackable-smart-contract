const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());
const { abi , evm } = require('../compile');


/**
 *  @var { string}  - (accounts) To holds list of all accounts provided by ganache test network
 *  @var {String} - (vendingMachine) The deployed vending machine smart contract instance
 */
let accounts, vendingMachine;


beforeEach(async()=> {
    //Get a list of all accounts
    accounts = await web3.eth.getAccounts();


    //Use one of those of accounts to deploy the contract
    //with a required minimum reserve of amount 1 ether
    vendingMachine = await new web3.eth.Contract(abi)
                                .deploy({ data: evm.bytecode.object })
                                .send({ 
                                    from: accounts[0],
                                     gas: '2000000',
                                    value: web3.utils.toWei('1', 'ether')
                                 })

});

describe('Vending Machine Contract satisfies the following tests: ', () =>{
    //Test for deployment of the contract
    it('Deploys a contract', ()=> {
        assert.ok(vendingMachine.options.address);
    });

    //Test for default ether amount as reserve in the smart contract
    it('Has a default ether reserve balance in the contract', async() => {
        const reserve = await vendingMachine.methods.getReserveAmount().call({ from: accounts[0] });
        assert.equal(web3.utils.toWei('1', 'ether'), reserve);
    });

    //Test to see if contract allows a user to deposit below minimum amount needed
    it('Doesn\'t allow a user to deposit below minimum amount', async()=> {
        try {
            await vendingMachine.methods.deposit().send({ 
                from: accounts[1], 
                value: web3.utils.toWei('0.01', 'ether')    // less than 0.1 ether minimum deposit requirement; the test should
                                                            // pass because it asserts for error in the catch block
            });            
        } catch (error) {
            assert(error);
            return;
        }

        assert(false);
    });


    //Test to see if it allows a user to deposit at least the minimum amount
    it('Allows a user to deposit at least minimum amount', async()=> {
        const amountToDeposit = web3.utils.toWei('0.1', 'ether');

        await vendingMachine.methods.deposit().send({ 
            from: accounts[1], 
            value: amountToDeposit
        });

        const amountDeposited = await vendingMachine.methods.consumersDeposit(accounts[1]).call();
        assert.equal(amountToDeposit, amountDeposited);
    });


    //Test for multiple users deposit
    it('Allow multiple users to deposit at least minimum amount', async()=> {
        const amountToDepositby2 =  web3.utils.toWei('0.22', 'ether');
        const amountToDepositby3 =  web3.utils.toWei('0.3', 'ether');
        
        await vendingMachine.methods.deposit().send({ 
            from: accounts[2], 
            value: amountToDepositby2
        });

        await vendingMachine.methods.deposit().send({ 
            from: accounts[3], 
            value: amountToDepositby3
        });

        const amountDepositedBy2 = await vendingMachine.methods.consumersDeposit(accounts[2]).call();
        const amountDepositedBy3 = await vendingMachine.methods.consumersDeposit(accounts[3]).call();

        assert.equal(amountToDepositby2, amountDepositedBy2);
        assert.equal(amountToDepositby3, amountDepositedBy3);
    });


    //Test to see if user can deposit and buy
    it('Allows a user to deposit and buy peanuts', async() => {
        const amountToDeposit = web3.utils.toWei('0.8', 'ether');

        await vendingMachine.methods.deposit().send({ 
            from: accounts[1], 
            value: amountToDeposit
        });
        
        const amountDeposited = await vendingMachine.methods.consumersDeposit(accounts[1]).call();
        await vendingMachine.methods.getPeanuts(2).send({ from: accounts[1] });        
        const peanutsBought = await vendingMachine.methods.peanuts(accounts[1]).call();

        assert.equal(amountToDeposit, amountDeposited);
        assert.equal(2, peanutsBought);
    });


    //Test to see if user can deposit, buy and withdrawal any balance left
    it('Allows a user to deposit, buy peanuts and withdraw balance if any', async() => {
        const amountToDeposit = web3.utils.toWei('1', 'ether');
        const pricePerPeanut = web3.utils.toWei('0.1', 'ether');
        const peanutsToBuy = 8;

        await vendingMachine.methods.deposit().send({ 
            from: accounts[1], 
            value: amountToDeposit
        }); 
        const amountDeposited = await vendingMachine.methods.consumersDeposit(accounts[1]).call();

        await vendingMachine.methods.getPeanuts(peanutsToBuy).send({ from: accounts[1] });        
        const peanutsBought = await vendingMachine.methods.peanuts(accounts[1]).call();
        const balanceAfterPurchase = await vendingMachine.methods.consumersDeposit(accounts[1]).call();

        await vendingMachine.methods.withdrawal().send({ from: accounts[1] }); 
        const balanceAfterWithdrawal = await vendingMachine.methods.consumersDeposit(accounts[1]).call();

        const expectedBalance = amountToDeposit - (pricePerPeanut * peanutsToBuy);

        assert.equal(amountToDeposit, amountDeposited);
        assert.equal(peanutsToBuy, peanutsBought);
        assert.equal(expectedBalance.toString(), balanceAfterPurchase);
        assert.equal(0, balanceAfterWithdrawal);

    });
    
    
    //Test to see if it allows the owner of the contract to restock product
    it('Allows only owner to restock peanuts', async () => {
        const owner = accounts[0];

        const initialStockValue = await vendingMachine.methods.peanuts(vendingMachine.options.address).call({ from: owner});
        await vendingMachine.methods.restockPeanuts(10).send({ from: owner });
        const expectedStockValue = 10 + parseInt(initialStockValue);

        const finalStockValue = await vendingMachine.methods.peanuts(vendingMachine.options.address).call({ from: owner });
        

        assert.equal(expectedStockValue.toString(), finalStockValue);
    });

    
    //Test to see if it allows users other than the owner to restock product
    it('Denies others to restock peanuts except the owner', async() => {
        try {
            await vendingMachine.methods.restockPeanuts(10).send({ 
                from: accounts[1]         // Not the owner's account; the test should pass because it asserts for error 
                                          // in the catch block
            });

        } catch (error) {
            assert(error);
            return;
        }

        assert(false);
    });
});
