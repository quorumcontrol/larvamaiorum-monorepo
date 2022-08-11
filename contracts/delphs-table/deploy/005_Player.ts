import "hardhat-deploy";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) {
  const { deploy, execute, get } = deployments;
  const { deployer } = await getNamedAccounts();

  const forwarder = await get('TrustedForwarder')

  const player = await deploy("Player", {
    from: deployer,
    log: true,
    // deterministicDeployment: true,
    args: [
      forwarder.address,
    ],
  });

  if (player.newlyDeployed) {
    await execute(
      "Player",
      {
        log: true,
        from: deployer,
      },
      "setUsername",
      "deployer",
    );
  }
};
export default func;
