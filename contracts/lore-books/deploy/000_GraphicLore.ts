import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import testnetAddrs from '../delphs-table/deployments/skaletest/addresses.json'
import mainnetAddrs from '../delphs-table/deployments/skale/addresses.json'
import { network } from "hardhat";

const func: DeployFunction = async function ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) {
  const { deploy, execute } = deployments;
  const { deployer, delph } = await getNamedAccounts();

  const trustedForwarderAddress = network.tags['test'] ? testnetAddrs.TrustedForwarder : mainnetAddrs.TrustedForwarder

  const lore = await deploy("GraphicLore", {
    from: deployer,
    gasLimit: 4000000,
    log: true,
    args: [trustedForwarderAddress, delph],
  });

  if (lore.newlyDeployed) {
    await execute(
      "GraphicLore",
      {
        log: true,
        from: delph,
      },
      "setContractURI",
      "ipfs://bafybeicpap4fl6g5zvpha45h5ozx5mx3hzn5uvsxkwupk6u4ihmggz4bdy/contract.json"
    )

    await execute(
      "GraphicLore",
      {
        log: true,
        from: delph,
      },
      "setURI",
      "ipfs://bafybeidk44umddubz24fkbdbjd6zdbbjycc2f4d34jjltawyx5onm4tmva"
    )
  }
};
export default func;
