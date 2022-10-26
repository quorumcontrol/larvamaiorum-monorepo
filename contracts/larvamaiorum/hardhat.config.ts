import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy"
import './tasks'
import dotenv from 'dotenv'

dotenv.config()

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    delph: {
      default: 1,
    },
  },
  networks: {
    skale: {
      url: "https://mainnet.skalenodes.com/v1/haunting-devoted-deneb",
      accounts: [
        process.env.MAINNET_DEPLOYER_PRIVATE_KEY,
        process.env.DELPHS_PRIVATE_KEY,
      ].filter(
        (k) => !!k
      ) as string[],
      tags: ["mainnet"],
    },
    skaletest: {
      url: "https://staging-v2.skalenodes.com/v1/roasted-thankful-unukalhai",
      // gasPrice: 0,
      accounts: [
        process.env.SKALE_TEST_PRIVATE_KEY,
        process.env.DELPHS_PRIVATE_KEY,
      ].filter((k) => !!k) as string[],
      tags: ["test", "testskale"],
      timeout: 10000000,
    },
    calypso: {
      url: "https://mainnet.skalenodes.com/v1/honorable-steel-rasalhague",
      accounts: [
        process.env.CALYPSO_PRIVATE_KEY,
      ].filter((k) => !!k) as string[],
    },
  }
};

export default config;
