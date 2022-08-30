import "hardhat-deploy";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) {
  const { deploy, get, execute } = deployments;
  const { deployer, delph } = await getNamedAccounts();

  const forwarder = await get('TrustedForwarder')

  const gump = await deploy("Wootgump", {
    from: deployer,
    log: true,
    args: [forwarder.address, delph],
  })

  const ranker = await deploy("Ranker", {
    from: deployer,
    log: true,
    args: [gump.address],
  })

  if (ranker.newlyDeployed) {
    await execute(
      "Wootgump",
      {
        log: true,
        from: delph,
      },
      "setRanker",
      ranker.address
    )
  }

};
export default func;
