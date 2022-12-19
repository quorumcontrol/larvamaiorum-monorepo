import { providers, Wallet, utils } from "ethers"
import { memoize } from "./utils/memoize"
import { MatchResults__factory } from "../typechain/factories/MatchResults__factory"

const matchResultsAddr = "0x5950a0ee990d9D0850950Ca404771EAB43Ab12df"

const signer = memoize(() => {
  const provider = new providers.StaticJsonRpcProvider("https://mainnet.skalenodes.com/v1/haunting-devoted-deneb")
  return new Wallet(process.env.SIGNER_PRIVATE_KEY).connect(provider)
})

const matchResultsContract = memoize(() => {
  return MatchResults__factory.connect(matchResultsAddr, signer())
})

const writeWinner = async (matchId:string, winner:string) => {
  try {
    const writer = matchResultsContract()
    const tx = await writer.registerResults(utils.keccak256(Buffer.from(matchId)), winner)
    console.log("register ", matchId, winner, "tx: ", tx.hash)
    const receipt = await tx.wait()
    console.log("register ", matchId, winner, "tx: ", tx.hash, receipt.status)
    return receipt
  } catch (err) {
    throw err
  }
}

export default writeWinner
