import { providers } from "ethers";
import MulticallWrapper from "kasumah-multicall";
import { isTestnet } from "./networks";
import { memoize } from "./memoize";
import skaleAddresses from "./skaleAddresses";

// valid address for roasted-thankful-unukalhai testnet
MulticallWrapper.setMulticallAddress(499161117, '0xFB586e5A793279f81180d01d68AEd4932BCE2589')

export default memoize((provider: providers.Provider) => {
  const chainId = isTestnet ? skaleAddresses.testnet.id : skaleAddresses.mainnet.id
  return new MulticallWrapper(provider, chainId)
})
