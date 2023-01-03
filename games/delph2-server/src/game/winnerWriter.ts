import { providers, Wallet, utils } from "ethers"
import { memoize } from "./utils/memoize"
import { MatchResults__factory } from "../typechain/factories/MatchResults__factory"

const matchResultsAddr = "0x932FF5D7b4e3ACC8d91340Daa145E5AE89C10899"

const signer = memoize(() => {
  const provider = new providers.StaticJsonRpcProvider("https://mainnet.skalenodes.com/v1/haunting-devoted-deneb")
  return new Wallet(process.env.SIGNER_PRIVATE_KEY).connect(provider)
})

const matchResultsContract = memoize(() => {
  return MatchResults__factory.connect(matchResultsAddr, signer())
})

const writeWinner = async (matchId:string, winner:string) => {
  try {
    console.log('write winner')
    const writer = matchResultsContract()
    console.debug("writer received")
    const tx = await writer.registerResults(utils.keccak256(Buffer.from(matchId)), winner)
    console.log("register ", matchId, winner, "tx: ", tx.hash)
    const receipt = await tx.wait()
    console.log("register ", matchId, winner, "tx: ", tx.hash, receipt.status)
    return receipt
  } catch (err) {
    console.error("error writing: ", err)
    throw err
  }
}

export default writeWinner
