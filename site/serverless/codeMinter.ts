import { Wallet } from "ethers";
import { badgeOfAssemblyContract, listKeeperContract } from "../src/utils/contracts";
import { skaleProvider } from "../src/utils/skaleProvider";
import SimpleSyncher from "../src/utils/singletonQueue";
import { keccak256 } from "ethers/lib/utils";

if (!process.env.BADGE_MINTER_PRIVATE_KEY) {
  throw new Error("must have a badge minter private key")
}
if (!process.env.DELPHS_PRIVATE_KEY) {
  throw new Error("missing delph's private key")
}

const schainSigner = new Wallet(process.env.BADGE_MINTER_PRIVATE_KEY).connect(skaleProvider)
const delphSigner = new Wallet(process.env.DELPHS_PRIVATE_KEY).connect(skaleProvider)

const boa = badgeOfAssemblyContract("schain", schainSigner)
const listKeeper = listKeeperContract("delph", delphSigner)

const singleton = new SimpleSyncher("codeMinter")

export async function handle(event: any, _context: any, callback: any) {
  const { address, code, tokenId }:{address: string, code: string, tokenId: number} = JSON.parse(event.body)

  const list = keccak256(Buffer.from(`boa-${code}-${tokenId}`))
  const entry = keccak256(Buffer.from(address.toLowerCase()))

  const [alreadyMinted, maxSize, currentCount] = await Promise.all([
    listKeeper.contains(list, entry),
    listKeeper.listSize(list),
    listKeeper.count(list),
  ])

  if (maxSize.eq(0)) {
    return callback(null, {
      statusCode: 400,
      body: JSON.stringify({
        address,
        exists: false,
        error: "invalid code",
      }),
    })
  }

  if (alreadyMinted || (currentCount.gte(maxSize))) {
    return callback(null, {
      statusCode: 400,
      body: JSON.stringify({
        address,
        eligible: false,
        error: "Code is already used up",
        size: currentCount.toNumber(),
        maxSize: maxSize.toNumber(),
      }),
    })
  }

  try {
    const tx = await singleton.push(async () => {
      try {
        console.log("adding to list")
        await (await listKeeper.add(list, entry, { gasLimit: 350_000 })).wait()
        console.log("minting")
        const tx = await boa.mint(address, tokenId, 1, { gasLimit: 1_000_000 })
        console.log("coded badge", tokenId, "to", address,"txid: ", tx.hash)
        return tx
      } catch (err) {
        throw err
      }
    })
  
    return callback(null, {
      statusCode: 201,
      body: JSON.stringify({
        address,
        transactionId: tx.hash
      }),
    })
  } catch (err:any) {
    console.error("error minting: ", err)
    return callback(null, {
      statusCode: 500,
      body: JSON.stringify({
        address,
        tokenId,

        error: err.toString(),
      }),
    })
  }


}
