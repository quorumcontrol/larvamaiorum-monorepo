import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-deploy";
import './tasks'

dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.14",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
    },
    tableAdmin: {
      default: 1, // here this will by default take the first account as deployer
    },
  },
  networks: {
    skale: {
      url: "https://mainnet.skalenodes.com/v1/haunting-devoted-deneb",
      accounts: [process.env.DELPHS_PRIVATE_KEY].filter(
        (k) => !!k
      ) as string[],
      tags: ["mainnet"],
    },
    skaletest: {
      url: "https://staging-v2.skalenodes.com/v1/rapping-zuben-elakrab",
      // gasPrice: 0,
      accounts: [
        process.env.SKALE_TEST_PRIVATE_KEY,
      ].filter((k) => !!k) as string[],
      tags: ["test", "testskale"],
    },
  },
};

export default config;
