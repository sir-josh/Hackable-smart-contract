const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());
const { abi , evm } = require('../compile');


//Declare accounts variable that will holds list of all accounts 
//provided by ganache test network
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
    it('It deploys a contract', ()=> {
        assert.ok(vendingMachine.options.address);
    });

    
    it('It has a default ether reserve balance in the contract', async() => {
        const reserve = await vendingMachine.methods.getReserveAmount().call({ from: accounts[0] });
        assert.equal(web3.utils.toWei('1', 'ether'), reserve);
    });

    it('It allow a user to deposit at least minimum amount', async()=> {
        await vendingMachine.methods.deposit().send({ 
            from: accounts[1], 
            value: web3.utils.toWei('0.1', 'ether')
        });

        const amountDeposited = await vendingMachine.methods.consumersDeposit(accounts[1]).call();
        assert.equal(web3.utils.toWei('0.1', 'ether'), amountDeposited);
    });

    it('It allow multiple users to deposit at least minimum amount', async()=> {
        await vendingMachine.methods.deposit().send({ 
            from: accounts[2], 
            value: web3.utils.toWei('0.22', 'ether')
        });

        await vendingMachine.methods.deposit().send({ 
            from: accounts[3], 
            value: web3.utils.toWei('0.3', 'ether')
        });

        const amountDepositedBy2 = await vendingMachine.methods.consumersDeposit(accounts[2]).call();
        const amountDepositedBy3 = await vendingMachine.methods.consumersDeposit(accounts[3]).call();

        assert.equal(web3.utils.toWei('0.22', 'ether'), amountDepositedBy2);
        assert.equal(web3.utils.toWei('0.3', 'ether'), amountDepositedBy3);
    });
});
