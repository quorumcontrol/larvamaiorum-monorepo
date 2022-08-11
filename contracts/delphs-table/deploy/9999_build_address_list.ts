import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import buildAddressList from "../helpers/buildAddressList";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  buildAddressList()
};
export default func;
