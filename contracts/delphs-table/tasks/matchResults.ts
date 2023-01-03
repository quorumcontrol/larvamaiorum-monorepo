import { task } from "hardhat/config"
import { getMatchResultsContract } from "./helpers"

task("set-match-result-sender")
  .addParam("address")
  .setAction(async ({ address }, hre) => {
    const matchResults = await getMatchResultsContract(hre)
    const tx = await matchResults.grantRole(await matchResults.SENDER_ROLE(), address)
    console.log("tx: ", tx.hash)
    await tx.wait()
  })

