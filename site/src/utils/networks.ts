import testnetAddresses from '../../contracts/deployments/skaletest/addresses.json'

export const isTestnet = !process.env.NEXT_PUBLIC_MAINNET

export const addresses = () => {
  if (isTestnet) {
    return testnetAddresses
  }
  throw new Error('missing network')
}
