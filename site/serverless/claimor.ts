import { Wallet } from "ethers";
import { badgeOfAssemblyContract } from "../src/utils/contracts";
import { hasPudgy } from '../src/hooks/badgeOfAssembly/useHasPudgy'
import { skaleProvider } from "../src/utils/skaleProvider";
import SimpleSyncher from '../src/utils/singletonQueue';

if (!process.env.BADGE_MINTER_PRIVATE_KEY) {
  throw new Error("must have a badge minter private key")
}

const schainSigner = new Wallet(process.env.BADGE_MINTER_PRIVATE_KEY!).connect(skaleProvider)

console.log("badge minter: ", schainSigner.address)

const boa = badgeOfAssemblyContract().connect(schainSigner)

const singleton = new SimpleSyncher('claimor')

export async function handle(event: any, _context: any, callback: any) {
  const { address:reqAddr, tokenId } = JSON.parse(event.body)
  const address:string = reqAddr
  console.log("claimor processing", address, tokenId)

  if (!(await hasPudgy(address))) {
    console.error('no penguins')
    return callback(null, {
      statusCode: 400,
      body: JSON.stringify({
        address,
        error: 'You do not hold any penguins.'
      }),
    })
  }

  const tx = await singleton.push(async () => {
    const tx = await boa.mint(address, 11, 1)
    console.log('pudgy penguin', 'to', address,'txid: ', tx.hash)
    return tx
  })

  return callback(null, {
    statusCode: 201,
    body: JSON.stringify({
      address,
      transactionId: tx.hash
    }),
  })
}
