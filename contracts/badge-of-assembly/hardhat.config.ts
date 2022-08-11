import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "hardhat-deploy";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "./tasks";

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
    badgeMinter: {
      default: 1, // here this will by default take the first account as deployer
    },
  },
  networks: {
    mumbai: {
      url: "https://matic-mumbai.chainstacklabs.com",
      accounts:
        process.env.MUMBAI_PRIVATE_KEY !== undefined
          ? [process.env.MUMBAI_PRIVATE_KEY]
          : [],
      tags: ["testpolygon", "test"],
    },
    matic: {
      url: "https://polygon-rpc.com/",
      accounts:
        process.env.POLYGON_PRIVATE_KEY !== undefined
          ? [process.env.POLYGON_PRIVATE_KEY]
          : [],
    },
    skale: {
      url: "https://mainnet.skalenodes.com/v1/haunting-devoted-deneb",
      accounts: [process.env.BADGE_MINTER_PRIVATE_KEY].filter(
        (k) => !!k
      ) as string[],
      tags: ["mainnet"],
    },
    skaletest: {
      url: "https://staging-v2.skalenodes.com/v1/rapping-zuben-elakrab",
      // gasPrice: 0,
      accounts: [
        process.env.SKALE_TEST_PRIVATE_KEY,
        process.env.BADGE_MINTER_PRIVATE_KEY,
      ].filter((k) => !!k) as string[],
      tags: ["test", "testskale"],
    },
  },
};

export default config;
