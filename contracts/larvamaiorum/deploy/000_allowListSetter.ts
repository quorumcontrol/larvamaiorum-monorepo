import "hardhat-deploy";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function ({
  deployments,
  getNamedAccounts,
  network
}: HardhatRuntimeEnvironment) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const addresses = network.live ? {
    wootgump: '0x3aE57359041f6b59E42C87F021Cf99758ABca528',
    trustedForwarder: '0xe00e66A2713E924b9CC56319752021747dDDEaA3'
  } :
  {
    wootgump: '0x8D1E200a2C572f9738f26554AAcbC2F9a462EF2D',
    trustedForwarder: '0x7cC2757877Dc42F7216D3E8009cCB06f297BbAe7',
  }

  await deploy("AllowListSetter", {
    from: deployer,
    log: true,
    args: [addresses.trustedForwarder, addresses.wootgump, deployer],
  });

};
export default func;
