import { TrustedForwarder, TrustedForwarder__factory } from 'skale-relayer-contracts/lib/typechain-types'
import { BadgeOfAssembly, BadgeOfAssembly__factory } from "../../badge-of-assembly-types";
import { Accolades, Accolades__factory, DelphsTable, DelphsTable__factory, ListKeeper, ListKeeper__factory, Lobby, Lobby__factory, Player, Player__factory, Wootgump, Wootgump__factory } from "../../contracts/typechain";
import { memoize } from "../utils/memoize";
import multicallWrapper from "../utils/multicallWrapper";
import { addresses, isTestnet } from "../utils/networks";
import { skaleProvider } from "./skaleProvider";

const TESTNET_BOA = "0x6201CCc4842db6148df04A4b2d155FdC86E23b95";
const MAINNET_BOA = "0x2C6FD25071Fd516947682f710f6e9F5eD610207F";

export const BOA_ADDRESS = isTestnet ? TESTNET_BOA : MAINNET_BOA

// the extra unused parameter of _address is here because memoize just does a .toString() on the args and both the signer and provider become [Object Object] so they get memoized even if the provider/signer change
export const delphsContract = memoize(() => {
  const multiCall = multicallWrapper(skaleProvider);
  const unwrapped = DelphsTable__factory.connect(addresses().DelphsTable, skaleProvider);
  return multiCall.syncWrap<DelphsTable>(unwrapped);;
});

export const badgeOfAssemblyContract = memoize(() => {
  const multiCall = multicallWrapper(skaleProvider)
  return multiCall.syncWrap<BadgeOfAssembly>(BadgeOfAssembly__factory.connect(BOA_ADDRESS, skaleProvider))
})

// the extra unused parameter of _address is here because memoize just does a .toString() on the args and both the signer and provider become [Object Object] so they get memoized even if the provider/signer change
export const lobbyContract = memoize(() => {
  const multiCall = multicallWrapper(skaleProvider);
  const unwrapped = Lobby__factory.connect(addresses().Lobby, skaleProvider);
  return multiCall.syncWrap<Lobby>(unwrapped);
});

export const playerContract = memoize(() => {
  const multiCall = multicallWrapper(skaleProvider)
  return multiCall.syncWrap<Player>(Player__factory.connect(addresses().Player, skaleProvider))
})

export const trustedForwarderContract = memoize(() => {
  const multiCall = multicallWrapper(skaleProvider)
  return multiCall.syncWrap<TrustedForwarder>(TrustedForwarder__factory.connect(addresses().TrustedForwarder, skaleProvider))
})

export const wootgumpContract = memoize(() => {
  const multiCall = multicallWrapper(skaleProvider)
  return multiCall.syncWrap<Wootgump>(Wootgump__factory.connect(addresses().Wootgump, skaleProvider))
})

export const listKeeperContract = memoize(() => {
  const multiCall = multicallWrapper(skaleProvider)
  return multiCall.syncWrap<ListKeeper>(ListKeeper__factory.connect(addresses().ListKeeper, skaleProvider))
})

export const accoladesContract = memoize(() => {
  const multiCall = multicallWrapper(skaleProvider)
  return multiCall.syncWrap<Accolades>(Accolades__factory.connect(addresses().Accolades, skaleProvider))
})
