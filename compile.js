const path = require('path');
const fs = require('fs');
const solc = require('solc');

//Get the smart contract file path
const VendingMachine_Path = path.resolve(__dirname, 'contracts', 'VendingMachine.sol'); 

//Read-in the content of smart contract source code
const sourceCode = fs.readFileSync(VendingMachine_Path, 'utf8');


//The expected JSON formatted input, specifying the language, sources and outputSelection
const input = {
    language: 'Solidity',
    sources: {
        'VendingMachine.sol': {
            content: sourceCode,
        }
    },
    settings: {
        outputSelection: {
            '*': {
                '*': ['*']
            }
        }
    }
};

//Compile sourceCode
module.exports = JSON.parse(solc.compile(JSON.stringify(input))).contracts['VendingMachine.sol'].VendingMachine;