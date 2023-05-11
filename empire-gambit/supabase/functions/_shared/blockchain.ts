import { Signer, ethers, providers } from "https://esm.sh/ethers@5.7.2"
import { memoize } from "./memoize.ts";
import SimpleSyncher from "./SimpleSyncher.ts";
import { abi } from "./minervaABI.ts";

const calypsoRPCUrl = "https://mainnet.skalenodes.com/v1/honorable-steel-rasalhague"
const CONTRACT_ADDRESS = "0x733380792841C388256642e67a792c628F75E58b"

const NFT_STORAGE_URL = "https://api.nft.storage"

interface MinimalNFTStorageResponse {
  ok: boolean
  value: {
    cid: string
  }
}

interface NFTAttributes {
  name: string;
  description: string;
  image: string;
}

const mintSyncer = memoize(() => {
  return new SimpleSyncher()
})

const minterWallet = memoize(() => {
  const pk = Deno.env.get("MINTER_PRIVATE_KEY")!;
  const provider = new providers.StaticJsonRpcProvider(calypsoRPCUrl)
  return new ethers.Wallet(pk, provider)
})

const contract = (signer: Signer) => {
  return new ethers.Contract(CONTRACT_ADDRESS, abi, signer)
}

export const uploadMetadata = async (attributes: NFTAttributes) => {
  const metadata = {
    ...attributes,
    external_url: "https://empiregambit.com",
  }

  const file = new File([JSON.stringify(metadata)], "meta.json")

  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch(`${NFT_STORAGE_URL}/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${Deno.env.get("NFT_STORAGE_API_KEY")}`
    },
    body: formData,
  })

  console.log("response: ", response)

  return response.json() as Promise<MinimalNFTStorageResponse>
}

export const mint = async (to:string, attributes: NFTAttributes) => {
  const syncer = mintSyncer()
  const wallet = minterWallet()
  const readings = contract(wallet)

  const resp = await uploadMetadata(attributes)
  if (!resp.ok) {
    console.error("Failed to upload metadata: ", resp)
    throw new Error("Failed to upload metadata")
  }
  const url = `ipfs://${resp.value.cid}/meta.json`

  return syncer.push(async () => {
    const tx = await readings.safeMint(to, url)
    await tx.wait()
    return tx
  })
}