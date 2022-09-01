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

task("remove")
  .addParam("address")
  .setAction(async ({ address }, hre) => {
    const list = keccak256(Buffer.from(`graphic-lore-0`))
    const entry = keccak256(Buffer.from(address.toLowerCase()))
    const listKeeper = await getListKeeperContract(hre)
    const tx = await listKeeper.remove(list, entry)
    await tx.wait()
    console.log('tx: ', tx.hash)
  })
