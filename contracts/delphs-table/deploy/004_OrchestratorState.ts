import "hardhat-deploy";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) {
  const { deploy, get } = deployments;
  const { deployer } = await getNamedAccounts();

  const forwarder = await get('TrustedForwarder')

  await deploy("OrchestratorState", {
    from: deployer,
    log: true,
    args: [forwarder.address, deployer],
  });
};
export default func;
