import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { utils } from "ethers"

const func: DeployFunction = async function ({
  deployments,
  getNamedAccounts,
  ethers
}: HardhatRuntimeEnvironment) {
  const { deploy, execute } = deployments;
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
      value: 100,
    })
    console.log("sending 100 ether... tx hash: ", tx.hash)
    await tx.wait()
  }
};
export default func;
