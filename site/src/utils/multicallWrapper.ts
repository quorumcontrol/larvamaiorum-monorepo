import { providers } from "ethers";
import MulticallWrapper from "kasumah-multicall";
import { isTestnet } from "./networks";
import { memoize } from "./memoize";
import { skaleMainnet, skaleTestnet } from "./SkaleChains";

export default memoize((provider: providers.Provider) => {
  const chainId = isTestnet ? skaleTestnet.id : skaleMainnet.id
  return new MulticallWrapper(provider, chainId)
})
