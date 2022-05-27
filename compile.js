const path = require('path');
const fs = require('fs');
const solc = require('solc');

//Get the smart contract file path
const VendingMachine_Path = path.resolve(__dirname, 'contracts', 'VendingMachine.sol'); 

//Read-in the content of smart contract source code
const sourceCode = fs.readFileSync(VendingMachine_Path, 'utf-8');

//Compile sourceCode
console.log(solc.compile(sourceCode, 1));