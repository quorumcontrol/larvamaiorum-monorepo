import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy"
import dotenv from "dotenv"

dotenv.config();

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  solidity: {
    version: "0.8.18",
    settings: {
      optimizer: {
        enabled: true,
        runs: 10,
      },
    }
  },
  external: {
    contracts: [{
      artifacts: ["node_modules/@skaleboarder/safe-tools/artifacts", "node_modules/@skaleboarder/safe-tools/gnosis-safe-artifacts"],
      deploy: "node_modules/@skaleboarder/safe-tools/dist/hardhat/deploy",
    }],
  },
  namedAccounts: {
    deployer: {
      default: 0,
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
  }
};

export default config;
