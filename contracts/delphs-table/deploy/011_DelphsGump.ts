import "hardhat-deploy";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) {
  const { deploy, get } = deployments;
  const { deployer, delph } = await getNamedAccounts();

  const forwarder = await get('TrustedForwarder')
  const gump = await get('Wootgump')

  await deploy("DelphsGump", {
    from: deployer,
    log: true,
    args: [forwarder.address, gump.address, delph],
  })
};
export default func;
