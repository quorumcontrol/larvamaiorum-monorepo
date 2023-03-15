import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { utils } from "ethers"

const func: DeployFunction = async function ({
  deployments,
  getNamedAccounts,
  ethers
}: HardhatRuntimeEnvironment) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const faucet = await deploy("PoWSecure", {
    from: deployer,
    log: true,
    deterministicDeployment: true,
    args: [deployer],
  });

  if (faucet.newlyDeployed) {
    const signer = await ethers.getSigner(deployer)
    const tx = await signer.sendTransaction({
      to: faucet.address,
      value: utils.parseEther("50"),
    })
    console.log("sending 50 ether... tx hash: ", tx.hash)
    await tx.wait()
  }
};
export default func;
