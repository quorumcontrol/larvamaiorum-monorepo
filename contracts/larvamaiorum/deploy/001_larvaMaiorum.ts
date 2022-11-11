import "hardhat-deploy";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const metadataUrl = "ipfs://bafybeibuuzvmiifd5yh7y7l46sxpg5rrkhjd5gptkbhc6426dhb3heoniy"
const contractMetadata = "ipfs://bafkreiajw4ugyhw5dj2bt2fprsreqxlxaaj4fw3qroelhufzyq2d4sbh44"

const func: DeployFunction = async function ({
  deployments,
  getNamedAccounts,
  network
}: HardhatRuntimeEnvironment) {
  const { deploy, execute } = deployments;
  const { deployer } = await getNamedAccounts();

  const larvaMaiorum = await deploy("LarvaMaiorum", {
    from: deployer,
    log: true,
    args: ["Crypto Colosseum: Masks of the Ancients", "ccMasks"],
  });

  if (larvaMaiorum.newlyDeployed) {
    await execute(
      "LarvaMaiorum",
      {
        log: true,
        from: deployer
      },
      "addMetadataUri",
      metadataUrl,
    )

    await execute(
      "LarvaMaiorum",
      {
        log: true,
        from: deployer
      },
      "setContractURI",
      contractMetadata,
    )

    await execute(
      "LarvaMaiorum",
      {
        log: true,
        from: deployer
      },
      "setCurrentlyMinting",
      0,
    )

    await execute(
      "LarvaMaiorum",
      {
        log: true,
        from: deployer
      },
      "setMaxSupply",
      250,
    )
  }

};
export default func;



