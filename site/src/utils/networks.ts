import testnetAddresses from '../../contracts/deployments/skaletest/addresses.json'
import mainnetAddresses from '../../contracts/deployments/skale/addresses.json'

console.log("NEXT_PUBLIC_CONTEXT: ", process.env.NEXT_PUBLIC_CONTEXT, process.env.NEXT_PUBLIC_MAINNET)
export const isTestnet = (process.env.NEXT_PUBLIC_CONTEXT === "branch-deploy") || !process.env.NEXT_PUBLIC_MAINNET
console.log("is testnet: ", isTestnet)

export const addresses = () => {
  if (isTestnet) {
    return testnetAddresses
  }
  return mainnetAddresses
}
