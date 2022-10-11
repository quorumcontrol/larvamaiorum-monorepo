import { Wallet } from "ethers";
import { badgeOfAssemblyContract, listKeeperContract } from "../src/utils/contracts";
import { loreContract, loreTokens } from "../src/hooks/useLore";
import { skaleProvider } from "../src/utils/skaleProvider";
import SimpleSyncher from '../src/utils/singletonQueue';
import { keccak256 } from 'ethers/lib/utils';

if (!process.env.DELPHS_PRIVATE_KEY) {
  throw new Error("missing delph's private key")
}

const delphSigner = new Wallet(process.env.DELPHS_PRIVATE_KEY).connect(skaleProvider)

const lore = loreContract().connect(delphSigner)
const listKeeper = listKeeperContract("delph", delphSigner)
const boa = badgeOfAssemblyContract()

const singleton = new SimpleSyncher('loreMinter')

export async function handle(event: any, _context: any, callback: any) {
  const { address, tokenId }:{address: string, code: string, tokenId: number} = JSON.parse(event.body)

  const list = keccak256(Buffer.from(`graphic-lore-${tokenId}`))
  const entry = keccak256(Buffer.from(address.toLowerCase()))

  const token = loreTokens()[tokenId]
  if (!token) {
    return callback(null, {
      statusCode: 400,
      body: JSON.stringify({
        address,
        eligible: false,
        error: `Unknown token id: ${tokenId}`,
      }),
    })
  }

  if (!token.available) {
    return callback(null, {
      statusCode: 400,
      body: JSON.stringify({
        address,
        eligible: false,
        error: `Token is not yet available`,
      }),
    })
  }

  const [badges, alreadyMinted] = await Promise.all([
    boa.userTokens(address),
    listKeeper.contains(list, entry) ,
  ])

  if (badges.length === 0) {
    return callback(null, {
      statusCode: 400,
      body: JSON.stringify({
        address,
        eligible: false,
        error: 'You must have a Badge of Assembly to mint the lore.',
      }),
    })
  }
 
  if (alreadyMinted) {
    return callback(null, {
      statusCode: 400,
      body: JSON.stringify({
        address,
        eligible: false,
        error: 'Only one mint per address',
      }),
    })
  }

  try {
    const tx = await singleton.push(async () => {
      try {
        console.log('adding to list')
        await (await listKeeper.add(list, entry, { gasLimit: 350_000 })).wait()
        console.log('minting')
        const tx = await lore.mint(address, tokenId, 1, [], { gasLimit: 1_000_000 })
        console.log('lore', tokenId, 'to', address,'txid: ', tx.hash)
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
    console.error('error minting: ', err)
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
