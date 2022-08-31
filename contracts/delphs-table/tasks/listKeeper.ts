import "@nomiclabs/hardhat-ethers"
import { keccak256 } from "ethers/lib/utils"
import { task } from 'hardhat/config'
import { getListKeeperContract } from "./helpers"

task("create-code")
  .addParam("code")
  .addParam("tokenId")
  .addParam("max")
  .setAction(async ({ code, tokenId, max }, hre) => {
    const list = keccak256(Buffer.from(`boa-${code}-${tokenId}`))
    const listKeeper = await getListKeeperContract(hre)
    const tx = await listKeeper.setMaxListSize(list, max)
    await tx.wait()
    console.log("tx: ", tx.hash)
  })