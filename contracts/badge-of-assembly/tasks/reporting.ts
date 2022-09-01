import "@nomiclabs/hardhat-ethers";
import { task } from "hardhat/config";
import { getBadgeOfAssemblyContract } from "./helpers";

task("count")
  .addParam("tokenId")
  .setAction(async ({ tokenId }, hre) => {
    const boa = await getBadgeOfAssemblyContract(hre);
    const filter = boa.filters.TransferSingle(null, null, null, null, null)
    const res = await boa.queryFilter(filter)
    const filtered = res.filter((res) => {
      return res.args.id.eq(tokenId)
    })
    console.log("res: ", filtered.length, filtered)
  })