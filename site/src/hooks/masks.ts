import { useQuery } from 'react-query';
import { AllowListSetter, AllowListSetter__factory } from '../../masks/typechain-types'
import { getProvider, ProviderHolder } from "../utils/contracts";
import { memoize } from "../utils/memoize";
import multicallWrapper from "../utils/multicallWrapper";
import { isTestnet } from '../utils/networks';
import { skaleProvider } from '../utils/skaleProvider'
import testnetAddresses from '../../masks/deployments/skaletest/addresses.json'
// import mainnetAddresses from '../../masks/deployments/skale/addresses.json'

const addresses = memoize(() => {
  if (isTestnet) {
    return testnetAddresses
  }
  throw new Error('no mainnet deploy yet')
})

// the extra unused parameter of _address is here because memoize just does a .toString() on the args and both the signer and provider become [Object Object] so they get memoized even if the provider/signer change
const allowListContract = memoize((_providerName:string = "skaleProvider", providerOrSigner?:ProviderHolder) => {
  const multiCall = multicallWrapper(getProvider(providerOrSigner));
  const unwrapped = AllowListSetter__factory.connect(addresses().AllowListSetter, providerOrSigner || skaleProvider);
  return multiCall.syncWrap<AllowListSetter>(unwrapped);;
});

export const useMaskAllowListBalance = (address?:string) => {
  return useQuery(['/mask-allow-list-balance', address], async () => {
    const allowList = allowListContract()
    return allowList.balanceOf(address!)
  }, {
    enabled: !!address
  })
}
