import { Wallet } from "ethers";
import { badgeOfAssemblyContract, listKeeperContract } from "../src/utils/contracts";
import { skaleProvider } from "../src/utils/skaleProvider";
import SimpleSyncher from '../src/utils/singletonQueue';
import { keccak256 } from 'ethers/lib/utils';

if (!process.env.BADGE_MINTER_PRIVATE_KEY) {
  throw new Error("must have a badge minter private key")
}

const schainSigner = new Wallet(process.env.BADGE_MINTER_PRIVATE_KEY!).connect(skaleProvider)

const boa = badgeOfAssemblyContract().connect(schainSigner)
const listKeeper = listKeeperContract().connect(schainSigner)

const singleton = new SimpleSyncher('codeMinter')

export async function handle(event: any, _context: any, callback: any) {
  const { address, code, tokenId }:{address: string, code: string, tokenId: number} = JSON.parse(event.body)

  const list = keccak256(Buffer.from(`boa-${code}-${tokenId}`))

  const [alreadyMinted, maxSize, currentCount] = await Promise.all([
    listKeeper.contains(list, keccak256(Buffer.from(address.toLowerCase()))),
    listKeeper.listSize(list),
    listKeeper.count(list),
  ])

  if (maxSize.eq(0)) {
    return callback(null, {
      statusCode: 400,
      body: JSON.stringify({
        address,
        exists: false,
        error: 'invalid code',
      }),
    })
  }

  if (alreadyMinted || (currentCount.gte(maxSize))) {
    return callback(null, {
      statusCode: 400,
      body: JSON.stringify({
        address,
        eligible: false,
        error: 'Code is already used up',
        size: currentCount.toNumber(),
        maxSize: maxSize.toNumber(),
      }),
    })
  }

  try {
    const tx = await singleton.push(async () => {
      try {
        await (await listKeeper.add(list, address)).wait()
        const tx = await boa.mint(address, tokenId, 1)
        console.log('coded badge', tokenId, 'to', address,'txid: ', tx.hash)
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
