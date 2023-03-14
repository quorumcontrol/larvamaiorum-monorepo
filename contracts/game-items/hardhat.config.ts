import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy"

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  solidity: "0.8.18",
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
  }
};

export default config;
