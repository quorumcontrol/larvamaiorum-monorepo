import "hardhat-deploy";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) {
  const { deploy, get, execute  } = deployments;
  const { deployer, delph } = await getNamedAccounts();

  const forwarder = await get('TrustedForwarder')
  const gump = await get('Wootgump')

  console.log("delph: ", delph)

  const delphsGump = await deploy("DelphsGump", {
    from: deployer,
    log: true,
    args: [forwarder.address, gump.address, delph],
  })

  if (delphsGump.newlyDeployed) {
    await execute(
      "Wootgump",
      {
        log: true,
        from: delph,
      },
      "grantRole",
      "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6", // MINTER_ROLE
      delphsGump.address
    )
  }
};
export default func;
