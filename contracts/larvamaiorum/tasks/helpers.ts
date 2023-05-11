import { HardhatRuntimeEnvironment } from "hardhat/types"
import { AllowListSetter__factory } from "../typechain-types"

export const getDeployer = async (hre:HardhatRuntimeEnvironment) => {
  const { deployer: deployerAddr } = await hre.getNamedAccounts()
  return hre.ethers.getSigner(deployerAddr)
}

export const getAllowListSpot = async (hre:HardhatRuntimeEnvironment) => {
  const deploy = await import(
    `../deployments/${hre.network.name}/AllowListSetter.json`
  );

  const { AllowListSetter__factory } = await import("../typechain-types");

  return AllowListSetter__factory.connect(deploy.address, await getDeployer(hre))
}

export const getLarvaMaiorum = async (hre:HardhatRuntimeEnvironment) => {
  const deploy = await import(
    `../deployments/${hre.network.name}/LarvaMaiorum.json`
  );

  const { LarvaMaiorum__factory } = await import("../typechain-types");

  return LarvaMaiorum__factory.connect(deploy.address, await getDeployer(hre))
}

export const getMinervaReadings = async (hre:HardhatRuntimeEnvironment) => {
  const deploy = await import(
    `../deployments/${hre.network.name}/MinervaReadings.json`
  );

  const { MinervaReadings__factory } = await import("../typechain-types");

  return MinervaReadings__factory.connect(deploy.address, await getDeployer(hre))
}