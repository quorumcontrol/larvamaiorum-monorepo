import { HardhatRuntimeEnvironment } from "hardhat/types";

export async function getPlayerContract(
  hre: HardhatRuntimeEnvironment
) {
  const deploy = await import(
    `../deployments/${hre.network.name}/Player.json`
  );

  const { Player__factory } = await import("../typechain");

  return Player__factory.connect(deploy.address, await getDeployer(hre));
}

export async function getDelphsTableContract(
  hre: HardhatRuntimeEnvironment
) {
  const deploy = await import(
    `../deployments/${hre.network.name}/DelphsTable.json`
  );

  const { DelphsTable__factory } = await import("../typechain");

  return DelphsTable__factory.connect(deploy.address, await getDeployer(hre));
}

export async function getListKeeperContract(
  hre: HardhatRuntimeEnvironment
) {
  const deploy = await import(
    `../deployments/${hre.network.name}/ListKeeper.json`
  );
  const delph = await getDelph(hre)
  if (!delph) {
    throw new Error('no delph')
  }
  const { ListKeeper__factory } = await import("../typechain");

  return ListKeeper__factory.connect(deploy.address, delph)
}

export async function getLobbyContract(
  hre: HardhatRuntimeEnvironment
) {
  const deploy = await import(
    `../deployments/${hre.network.name}/Lobby.json`
  );

  const { Lobby__factory } = await import("../typechain");

  return Lobby__factory.connect(deploy.address, await getDeployer(hre));
}

export async function getDeployer(hre: HardhatRuntimeEnvironment) {
  return (await hre.ethers.getSigners())[0];
}

export async function getDelph(hre: HardhatRuntimeEnvironment) {
  const { delph } = await hre.getNamedAccounts()
  const signers = await hre.ethers.getSigners()
  return signers.find((s) => s.address.toLowerCase() === delph.toLowerCase())
}
