import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const getDeployer = async (hre: HardhatRuntimeEnvironment) => {
  const signers = await hre.ethers.getSigners();
  return signers[0];
};

export const getEmpireGambitToken = async (hre: HardhatRuntimeEnvironment) => {
  const deploy = await import(
    `../deployments/${hre.network.name}/EmpireGambitToken.json`
  );

  const { EmpireGambitToken__factory } = await import("../typechain-types");

  return EmpireGambitToken__factory.connect(
    deploy.address,
    await getDeployer(hre),
  );
};

task(
  "token:new-minter",
  "create a new EmpireGambitToken minter and output the new private key",
)
  .setAction(async (_, hre) => {
    const { ethers } = hre;
    const wallet = ethers.Wallet.createRandom();

    const contract = await getEmpireGambitToken(hre);
    const tx = await contract.grantRole(
      await contract.MINTER_ROLE(),
      wallet.address,
    );
    await tx.wait();
    console.log("pk: ", wallet.privateKey, "address: ", wallet.address);
  });

task("token:mint", "mint empire gambit tokens");

task("token:fund-minter", "fund a minter account with some sfuel")
  .addParam("address", "the address of the minter")
  .setAction(async ({ address }, hre) => {
    const deployer = await getDeployer(hre);
    const contract = await getEmpireGambitToken(hre);

    await (await contract.grantRole(await contract.MINTER_ROLE(), address))
      .wait();
    await (await contract.grantRole(await contract.BURNER_ROLE(), address))
      .wait();

    const tx = await deployer.sendTransaction({
      to: address,
      value: hre.ethers.utils.parseEther("1"),
    });
    console.log("tx: ", tx.hash);
    await tx.wait();
  });
