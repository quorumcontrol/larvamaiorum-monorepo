import * as dotenv from "dotenv";

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";

dotenv.config()

const config: HardhatUserConfig = {
  solidity: "0.8.9",
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
    },
    minter: {
      default: 1, // here this will by default take the first account as deployer
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
      url: "https://staging-v2.skalenodes.com/v1/rapping-zuben-elakrab",
      // gasPrice: 0,
      accounts: [
        process.env.SKALE_TEST_PRIVATE_KEY,
        process.env.DELPHS_PRIVATE_KEY,
      ].filter((k) => !!k) as string[],
      tags: ["test", "testskale"],
    },
  }
};

export default config;
