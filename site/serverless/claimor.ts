import { ethers, Wallet } from "ethers";
import { chain } from "wagmi";
import { badgeOfAssemblyContract, listKeeperContract } from "../src/utils/contracts";
import { skaleProvider } from "../src/utils/skaleProvider";
import { IERC721__factory } from '../badge-of-assembly-types'
import SimpleSyncher from '../src/utils/singletonQueue';

if (!process.env.BADGE_MINTER_PRIVATE_KEY || !process.env.DELPHS_PRIVATE_KEY) {
  throw new Error("must have a badge minter private key")
}

const mainnetProvider = new ethers.providers.AlchemyProvider(
  chain.mainnet.id,
  process.env.NEXT_PUBLIC_ALCHEMY_KEY
);

const schainSigner = new Wallet(process.env.BADGE_MINTER_PRIVATE_KEY!).connect(skaleProvider)

const delphSigner = new Wallet(process.env.DELPHS_PRIVATE_KEY).connect(skaleProvider)
const listKeeper = listKeeperContract().connect(delphSigner)

const pudgies = IERC721__factory.connect('0xbd3531da5cf5857e7cfaa92426877b022e612cf8', mainnetProvider)

const boa = badgeOfAssemblyContract().connect(schainSigner)

const singleton = new SimpleSyncher('claimor')

export async function handle(event: any, _context: any, callback: any) {
  const { address:reqAddr } = JSON.parse(event.body)
  const address:string = reqAddr

  const balance = await pudgies.balanceOf(address)
  if (balance.eq(0)) {
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
