import { Wallet } from "ethers";
import { badgeOfAssemblyContract } from "../src/utils/contracts";
import { skaleProvider } from "../src/utils/skaleProvider";
import SimpleSyncher from '../src/utils/singletonQueue';
import { addresses, isTestnet } from "../src/utils/networks";
import multicallWrapper from "../src/utils/multicallWrapper";
import { memoize } from "../src/utils/memoize";
import { ListKeeper, ListKeeper__factory } from "../contracts/typechain";
import { keccak256 } from "ethers/lib/utils";

const API_ENDPOINT = 'https://discord.com/api/v10'
const NFT_BERLIN_GUILD_ID = "910069601046523914"

const TOKEN_ID = isTestnet ? 4 : 5

if (!process.env.BADGE_MINTER_PRIVATE_KEY) {
  throw new Error("must have a badge minter private key")
}

const schainSigner = new Wallet(process.env.BADGE_MINTER_PRIVATE_KEY!).connect(skaleProvider)

const listKeeperContract = memoize(() => {
  const multiCall = multicallWrapper(skaleProvider)
  return multiCall.syncWrap<ListKeeper>(ListKeeper__factory.connect(addresses().ListKeeper, schainSigner))
})

const boa = badgeOfAssemblyContract().connect(schainSigner)
const listKeeper = listKeeperContract()

const LIST = keccak256(Buffer.from('nft-club-berlin-minted'))

const singleton = new SimpleSyncher('nftClubBerlin')

const redirectUrl = isTestnet ?
  "http://localhost:3000/badge-of-assembly/claim/nft-club-berlin" :
  "https://cryptocolosseum.com/badge-of-assembly/claim/nft-club-berlin"

export async function handle(event: any, _context: any, callback: any) {  
  if (!process.env.DISCORD_CLIENT_ID || !process.env.DISCORD_CLIENT_SECRET) {
    throw new Error('missing env variables')
  }

  try {
    const { code, state } = event.queryStringParameters

    const requestData: Record<string, string> = {
      'client_id': process.env.DISCORD_CLIENT_ID,
      'client_secret': process.env.DISCORD_CLIENT_SECRET,
      'grant_type': 'authorization_code',
      'code': code as string,
      'redirect_uri': "http://localhost:3000/api/auth/discord"
    }
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  
    const formData = new URLSearchParams();
    Object.keys(requestData).forEach((key) => {
      formData.append(key, requestData[key])
    })
  
    const response = await fetch(`${API_ENDPOINT}/oauth2/token`, {
      method: 'POST',
      body: formData,
      headers,
    })
  
    const { access_token, token_type, ...restOfResponse } = await response.json()
    if (!access_token) {
      console.error("response", restOfResponse, response)
      throw new Error('oh no')
    }
    console.log('rest of response: ', restOfResponse)
  

    const [userResponse, guildsResponse] = await Promise.all([
      fetch('https://discord.com/api/users/@me', {
        headers: {
          authorization: `${token_type} ${access_token}`,
        },
      }),
      fetch('https://discord.com/api/users/@me/guilds', {
        headers: {
          authorization: `${token_type} ${access_token}`,
        },
      })
    ])

  
    const [guilds, user] = await Promise.all([
      guildsResponse.json(),
      userResponse.json(),
    ])

    const listIdentifier = keccak256(Buffer.from(`id:${user.id}`))
    
    if (await listKeeper.contains(LIST, listIdentifier)) {
      const query = new URLSearchParams()
      query.append('error', 'Already minted this badge')
      return callback(null, {
        statusCode: 302,
        headers: {
          Location: `${redirectUrl}?${query}`
        }
      }) 
    }

    const isNFTBerlinMember = guilds.some((g:any) => g.id === NFT_BERLIN_GUILD_ID)
  
    console.log('user: ', user, 'isMember', isNFTBerlinMember)

    if (!isNFTBerlinMember) {
      const query = new URLSearchParams()
      query.append('error', 'You are not a member')
      return callback(null, {
        statusCode: 302,
        headers: {
          Location: `${redirectUrl}?${query}`
        }
      }) 
    }
  
    const tx = await singleton.push(async () => {
      try {
        console.log('minting', TOKEN_ID, 'to', state)
        const mint = await boa.mint(state, TOKEN_ID, 1, { gasLimit: 1_000_000 })
        await mint.wait()
        console.log('mint succeeded')
        await listKeeper.add(LIST, listIdentifier)
        console.log("list keeper succeeded")
        return mint
      } catch (err) {
        console.error('error with transactions')
        throw err
      }
    })
  
    const query = new URLSearchParams()
    query.append('transactionHash', tx.hash)
  
    return callback(null, {
      statusCode: 302,
      headers: {
        Location: `${redirectUrl}?${query}`
      }
    })
  } catch (err) {
    const query = new URLSearchParams()
    query.append('error', `${err}`)

    return callback(null, {
      statusCode: 302,
      headers: {
        Location: `${redirectUrl}?${query}`
      }
    })
  }

}
