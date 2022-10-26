import { useMutation, useQuery, useQueryClient } from 'react-query';
import { AllowListSetter, AllowListSetter__factory } from '../../masks/typechain-types'
import { getProvider, ProviderHolder, wootgumpContract } from "../utils/contracts";
import { memoize } from "../utils/memoize";
import multicallWrapper from "../utils/multicallWrapper";
import { isTestnet } from '../utils/networks';
import { skaleProvider } from '../utils/skaleProvider'
import testnetAddresses from '../../masks/deployments/skaletest/addresses.json'
import { useRelayer } from './useUser';
import { BigNumber } from 'ethers';
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

export const usePresaleSpotsRemaining = () => {
  return useQuery(['/presale-spots-remaining'], async () => {
    const allowList = allowListContract()
    return allowList.supply()
  })
}

export const usePresalePrice = () => {
  return useQuery(['/mask-presale-price'], async () => {
    const allowList = allowListContract()
    return allowList.currentPrice()
  })
}

export const usePurchaseMask = () => {
  const queryClient = useQueryClient();
  const { data:relayer } = useRelayer()

  return useMutation(async ({ addr, cost }: { addr: string, cost:BigNumber }) => {
    if (!relayer?.ready()) {
      throw new Error("the relayer must be ready to register interest");
    }
    if (!addr) {
      throw new Error('no address')
    }

    const allowList = allowListContract()
    const wootgump = wootgumpContract()

    const approveTx = await wootgump.populateTransaction.approve(allowList.address, cost)
    const buyTx = await allowList.populateTransaction.buy(addr)

    console.log("purchase topic: ", allowList.interface.getEventTopic('Purchase'))

    const tx = await relayer.multisend([approveTx, buyTx])

    try {
      const receipt = await tx.wait()
      console.log('receipt: ', receipt)

      if (receipt.logs.length <= 1) {
        throw new Error('no purchase happened')
      }
      // just do this so it errors if it's not right
      // allowList.interface.parseLog(receipt.logs[1])
    } catch (err) {
      console.error('error with tx: ', tx)
      throw err
    }

    return {
      address: addr,
      transactionHash: tx.hash
    }
  }, {
    // TODO: example of mutation
    // onMutate: async (thisPlayer) => {
    //   await queryClient.cancelQueries(WAITING_PLAYERS_KEY)

    //   const previousPlayers = queryClient.getQueryData(WAITING_PLAYERS_KEY)
 
    //   // Optimistically update to the new value
    //   queryClient.setQueryData(WAITING_PLAYERS_KEY, (old:{addr:string}[]|undefined) => [...(old || []), thisPlayer])
  
    //   // Return a context object with the snapshotted value
    //   return { previousPlayers }
      
    // },
    onSettled: (data) => {
      if (!data) {
        console.error('on settled without data')
        return
      }
      queryClient.invalidateQueries(['/mask-allow-list-balance', data?.address], {
        refetchInactive: true,
      });
      queryClient.invalidateQueries(["/wootgump-balance", data?.address], {
        refetchInactive: true,
      });
      queryClient.invalidateQueries(['/presale-spots-remaining'], {
        refetchInactive: true,
      });
    }
  });
}
