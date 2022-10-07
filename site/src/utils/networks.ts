import testnetAddresses from '../../contracts/deployments/skaletest/addresses.json'
import mainnetAddresses from '../../contracts/deployments/skale/addresses.json'

export const isTestnet = !process.env.NEXT_PUBLIC_MAINNET || (process.env.NEXT_PUBLIC_CONTEXT == "branch-deploy")

export const addresses = () => {
  if (isTestnet) {
    return testnetAddresses
  }
  return mainnetAddresses
}
