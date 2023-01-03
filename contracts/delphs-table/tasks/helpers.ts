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

export async function getWootgumpContract(
  hre: HardhatRuntimeEnvironment
) {
  const deploy = await import(
    `../deployments/${hre.network.name}/Wootgump.json`
  );

  const { Wootgump__factory } = await import("../typechain");
  const delph = await getDelph(hre)
  if (!delph) {
    throw new Error('missing delph')
  }
  return Wootgump__factory.connect(deploy.address, delph);
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

export async function getDelphsGumpContract(
  hre: HardhatRuntimeEnvironment
) {
  const deploy = await import(
    `../deployments/${hre.network.name}/DelphsGump.json`
  );
  const delph = await getDelph(hre)
  if (!delph) {
    throw new Error('missing delph')
  }
  const { DelphsGump__factory } = await import("../typechain");

  return DelphsGump__factory.connect(deploy.address, delph);
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

export async function getAccoladeContract(
  hre: HardhatRuntimeEnvironment
) {
  const deploy = await import(
    `../deployments/${hre.network.name}/Accolades.json`
  );
  const delph = await getDelph(hre)
  if (!delph) {
    throw new Error('no delph')
  }
  const { Accolades__factory } = await import("../typechain");

  return Accolades__factory.connect(deploy.address, delph)
}

export async function getMatchResultsContract(
  hre: HardhatRuntimeEnvironment
) {
  const deploy = await import(
    `../deployments/${hre.network.name}/MatchResults.json`
  );
  const delph = await getDelph(hre)
  if (!delph) {
    throw new Error('no delph')
  }
  const { MatchResults__factory } = await import("../typechain");

  return MatchResults__factory.connect(deploy.address, delph)
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
