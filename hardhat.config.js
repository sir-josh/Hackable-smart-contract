require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();

/**
 * @type import('hardhat/config').HardhatUserConfig
 */

 const { INFURA_URL, PRIVATE_KEY, API_KEY } = process.env;

module.exports = {
  solidity: "0.8.9",
  defaultNetwork: "rinkeby",
  networks: {
    hardhat: {},
    rinkeby: {
      url: INFURA_URL,
      accounts: [PRIVATE_KEY]
    }
  },
  etherscan: {
    apiKey: API_KEY
  }
};
