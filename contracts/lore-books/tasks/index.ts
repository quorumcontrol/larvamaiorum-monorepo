import { task } from 'hardhat/config'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

export async function getGraphicLoreContract(
  hre: HardhatRuntimeEnvironment
) {
  console.log("using network: ", hre.network.name);
  const deploy = await import(
    `../deployments/${hre.network.name}/GraphicLore.json`
  );

  const { GraphicLore__factory } = await import("../typechain-types");

  const signer = (await hre.ethers.getSigners())[0];

  return GraphicLore__factory.connect(deploy.address, signer);
}


task("count")
  .setAction(async (_, hre) => {
    const graphicLore = await getGraphicLoreContract(hre)
    const filter = graphicLore.filters.TransferSingle(null, null, null, null, null)
    const res = await graphicLore.queryFilter(filter)
    console.log("count: ", res.length)
  })