import { NonceManager } from '@ethersproject/experimental';
import { providers, Signer } from 'ethers';
import { TrustedForwarder, TrustedForwarder__factory } from 'skale-relayer-contracts/lib/typechain-types'
import { BadgeOfAssembly, BadgeOfAssembly__factory } from "../../badge-of-assembly-types";
import { Accolades, Accolades__factory, DelphsGump, DelphsGump__factory, DelphsTable, DelphsTable__factory, ListKeeper, ListKeeper__factory, Lobby, Lobby__factory, Player, Player__factory, Wootgump, Wootgump__factory } from "../../contracts/typechain";
import { memoize } from "../utils/memoize";
import multicallWrapper from "../utils/multicallWrapper";
import { addresses, isTestnet } from "../utils/networks";
import { skaleProvider } from "./skaleProvider";

const TESTNET_BOA = "0x6201CCc4842db6148df04A4b2d155FdC86E23b95";
const MAINNET_BOA = "0x2C6FD25071Fd516947682f710f6e9F5eD610207F";

export const BOA_ADDRESS = isTestnet ? TESTNET_BOA : MAINNET_BOA

export type ProviderHolder = providers.Provider|Signer|NonceManager

export function getProvider(providerOrSigner?:ProviderHolder):providers.Provider {
  if (!providerOrSigner) {
    return skaleProvider
  }
  if ((providerOrSigner as any).provider) {
    return (providerOrSigner as Signer).provider!
  }
  return providerOrSigner as providers.Provider
}

// the extra unused parameter of _address is here because memoize just does a .toString() on the args and both the signer and provider become [Object Object] so they get memoized even if the provider/signer change
export const delphsContract = memoize((_providerName:string = "skaleProvider", providerOrSigner?:ProviderHolder) => {
  const multiCall = multicallWrapper(getProvider(providerOrSigner));
  const unwrapped = DelphsTable__factory.connect(addresses().DelphsTable, providerOrSigner || skaleProvider);
  return multiCall.syncWrap<DelphsTable>(unwrapped);;
});

export const badgeOfAssemblyContract = memoize((_providerName:string = "skaleProvider", providerOrSigner?:ProviderHolder) => {
  const multiCall = multicallWrapper(getProvider(providerOrSigner));
  return multiCall.syncWrap<BadgeOfAssembly>(BadgeOfAssembly__factory.connect(BOA_ADDRESS, providerOrSigner || skaleProvider))
})

// the extra unused parameter of _address is here because memoize just does a .toString() on the args and both the signer and provider become [Object Object] so they get memoized even if the provider/signer change
export const lobbyContract = memoize((_providerName:string = "skaleProvider", providerOrSigner?:ProviderHolder) => {
  const multiCall = multicallWrapper(getProvider(providerOrSigner));
  const unwrapped = Lobby__factory.connect(addresses().Lobby, providerOrSigner || skaleProvider);
  return multiCall.syncWrap<Lobby>(unwrapped);
});

export const playerContract = memoize((_providerName:string = "skaleProvider", providerOrSigner?:ProviderHolder) => {
  const multiCall = multicallWrapper(getProvider(providerOrSigner));
  return multiCall.syncWrap<Player>(Player__factory.connect(addresses().Player, providerOrSigner || skaleProvider))
})

export const trustedForwarderContract = memoize((_providerName:string = "skaleProvider", providerOrSigner?:ProviderHolder) => {
  const multiCall = multicallWrapper(getProvider(providerOrSigner));
  return multiCall.syncWrap<TrustedForwarder>(TrustedForwarder__factory.connect(addresses().TrustedForwarder, providerOrSigner || skaleProvider))
})

export const wootgumpContract = memoize((_providerName:string = "skaleProvider", providerOrSigner?:ProviderHolder) => {
  const multiCall = multicallWrapper(getProvider(providerOrSigner));
  return multiCall.syncWrap<Wootgump>(Wootgump__factory.connect(addresses().Wootgump, providerOrSigner || skaleProvider))
})

export const delphsGumpContract = memoize((_providerName:string = "skaleProvider", providerOrSigner?:ProviderHolder) => {
  const multiCall = multicallWrapper(getProvider(providerOrSigner));
  return multiCall.syncWrap<DelphsGump>(DelphsGump__factory.connect(addresses().DelphsGump, providerOrSigner || skaleProvider))
})

// you need to have a name here because of the memoize which if missing the name just uses "[Object object]" to memoize and so writes over the old memoize
export const listKeeperContract = memoize((_providerName:string = "skaleProvider", providerOrSigner?:ProviderHolder) => {
  const multiCall = multicallWrapper(getProvider(providerOrSigner));
  return multiCall.syncWrap<ListKeeper>(ListKeeper__factory.connect(addresses().ListKeeper, providerOrSigner || skaleProvider))
})

export const accoladesContract = memoize((_providerName:string = "skaleProvider", providerOrSigner?:ProviderHolder) => {
  const multiCall = multicallWrapper(getProvider(providerOrSigner));
  return multiCall.syncWrap<Accolades>(Accolades__factory.connect(addresses().Accolades, providerOrSigner || skaleProvider))
})
