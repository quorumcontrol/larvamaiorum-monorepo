import "hardhat-deploy";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) {
  const { deploy, get } = deployments
  const { deployer, delph } = await getNamedAccounts()

  const forwarder = await get('TrustedForwarder')
  const roller = await get('DiceRoller')

  await deploy("DelphsTable", {
    from: deployer,
    log: true,
    // deterministicDeployment: true,
    args: [forwarder.address, roller.address, delph],
  });
};
export default func;
