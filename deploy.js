const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
require('dotenv').config();

const { abi, evm } = require('./compile');

const provider = new HDWalletProvider(
    process.env.PRIVATE_KEY,                       //YOUR_PRIVATE_KEY or YOUR_ACCOUNT_MNEMONIC here
    process.env.INFURA_URL                        //INFURA_URL link for rinkeby network
);

const web3 = new Web3(provider);

const deploy = async () => {
    const accounts = await web3.eth.getAccounts();

    console.log('Attempting to deploy from account', accounts[0]);
    
    const result = await new web3.eth.Contract(abi)
                                .deploy({ data: evm.bytecode.object })
                                .send({ 
                                    gas: '1000000', 
                                    from: accounts[0], 
                                    value: web3.utils.toWei('1', 'ether') 
                                });

    console.log('Contract deployed to ', result.options.address);
    provider.engine.stop();
}

deploy();