export default function ipfsToWeb(url:string) {
  if (!url.startsWith('ipfs://')) {
    return url
  }
  return url.replace('ipfs://', 'https://nftstorage.link/ipfs/')
}
