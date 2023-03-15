import { task } from "hardhat/config";
import { PoWSecure__factory } from "../typechain-types";
import { AnonymousPoW } from "@skaleproject/pow-ethers"

task("test-pow")
  .setAction(async(_, hre) => {
    const { deployments, ethers, network } = hre;

    const wallet = ethers.Wallet.createRandom().connect(ethers.provider)
    

    const powDeploy = await deployments.get("PoWSecure")
    const pow = PoWSecure__factory.connect(powDeploy.address, wallet)

    const populatedTx = await pow.populateTransaction.pay(wallet.address)

    const powInstance = new AnonymousPoW({ rpcUrl: (network.config as any).url! })
    const tx = await powInstance.send({
      to: pow.address,
      data: populatedTx.data!,
    })

    console.log("tx: ", tx)
    await tx.wait()

  })