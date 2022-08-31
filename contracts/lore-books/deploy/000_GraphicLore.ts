import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import testnetAddrs from '../delphs-table/deployments/skaletest/addresses.json'
import mainnetAddrs from '../delphs-table/deployments/skale/addresses.json'
import { network } from "hardhat";

const func: DeployFunction = async function ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) {
  const { deploy } = deployments;
  const { deployer, delph } = await getNamedAccounts();

  const trustedForwarderAddress = network.tags['test'] ? testnetAddrs.TrustedForwarder : mainnetAddrs.TrustedForwarder

  await deploy("GraphicLore", {
    from: deployer,
    gasLimit: 4000000,
    log: true,
    args: [trustedForwarderAddress, delph],
  });
};
export default func;
