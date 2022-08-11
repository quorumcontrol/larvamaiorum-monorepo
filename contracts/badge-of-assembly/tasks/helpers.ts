import "@nomiclabs/hardhat-ethers";
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

export async function getBadgeOfAssemblyContract(
  hre: HardhatRuntimeEnvironment
) {
  console.log("using network: ", hre.network.name);
  const deploy = await import(
    `../deployments/${hre.network.name}/BadgeOfAssembly.json`
  );

  const { BadgeOfAssembly__factory } = await import("../typechain");

  const signer = (await hre.ethers.getSigners())[0];

  return BadgeOfAssembly__factory.connect(deploy.address, signer);
}

task("chainprint").setAction(async (_, hre) => {
  const provider = hre.ethers.provider;
  console.log(await provider.getNetwork());
});

task("owner").setAction(async (_, hre) => {
  const boa = await getBadgeOfAssemblyContract(hre);
  const owner = await boa.owner();
  console.log("owner: ", owner);
  console.log("deployer", (await hre.ethers.getSigners())[1]);
});

task("allow")
  .addParam("id", "the token id")
  .addParam("newMinter")
  .setAction(async ({ id, newMinter }, hre) => {
    const boa = await getBadgeOfAssemblyContract(hre);
    const tx = await boa.setMinterAccess(id, newMinter, true);
    console.log("tx id:", tx.hash);
    await tx.wait();
  });
