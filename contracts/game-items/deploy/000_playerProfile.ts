import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  await deploy("PlayerProfile", {
    from: deployer,
    gasLimit: 4000000,
    log: true,
    deterministicDeployment: true,
    args: [deployer],
  });
};
export default func;
