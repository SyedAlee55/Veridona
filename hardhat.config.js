require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
/** @type import('hardhat/config').HardhatUserConfig */


module.exports = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url:`https://sepolia.infura.io/v3/${process.env.PRIVATE_KEY}`,
      accounts: [process.env.ACCOUNT],
      chainId: process.env.CHAINID
    },
  }
};