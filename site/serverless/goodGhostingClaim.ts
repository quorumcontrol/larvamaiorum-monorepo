import eligibleAddresses from './goodGhostingAddresses'
import { Wallet } from "ethers";
import { badgeOfAssemblyContract } from "../src/utils/contracts";
import { skaleProvider } from "../src/utils/skaleProvider";
import SimpleSyncher from '../src/utils/singletonQueue';

if (!process.env.BADGE_MINTER_PRIVATE_KEY) {
  throw new Error("must have a badge minter private key")
}

const schainSigner = new Wallet(process.env.BADGE_MINTER_PRIVATE_KEY!).connect(skaleProvider)

const boa = badgeOfAssemblyContract().connect(schainSigner)

const singleton = new SimpleSyncher('goodGhostingClaimer')

export async function handle(event: any, _context: any, callback: any) {
  const { address:reqAddr } = JSON.parse(event.body)
  const address:string = reqAddr

  if (!eligibleAddresses.includes(address.toLowerCase())) {
    return callback(null, {
      statusCode: 400,
      body: JSON.stringify({
        address,
        eligible: false
      }),
    })
  }

  const tx = await singleton.push(async () => {
    const tx = await boa.mint(address, 4, 1)
    console.log('good ghosting badge', 'to', address,'txid: ', tx.hash)
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
