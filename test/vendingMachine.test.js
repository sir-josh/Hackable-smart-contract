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
});
