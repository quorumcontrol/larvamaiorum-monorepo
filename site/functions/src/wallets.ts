import {utils, Wallet } from "ethers";
import * as functions from "firebase-functions";
import KasumahRelayer from "skale-relayer-contracts/lib/src/KasumahRelayer"
import { wrapContract } from "kasumah-relay-wrapper"
import { addresses } from "../../src/utils/networks"
import { skaleProvider } from "../../src/utils/skaleProvider";
import { accoladesContract, delphsContract, delphsGumpContract, listKeeperContract, playerContract, trustedForwarderContract } from "../../src/utils/contracts";
import { questTrackerContract } from "../../src/utils/questTracker";
import { memoize } from "../../src/utils/memoize";
import { Accolades, DelphsGump, DelphsTable, ListKeeper, Player, QuestTracker, TeamStats, TeamStats2__factory } from "../../contracts/typechain";
import { getBytesAndCreateToken } from "skale-relayer-contracts/lib/src/tokenCreator";
// import { BadgeOfAssembly } from "../../badge-of-assembly-types";
import { defineSecret } from "firebase-functions/params";

export const delphsPrivateKey = defineSecret("DELPHS_PRIVATE_KEY")

export const walletAndContracts = memoize(async (walletKey: string) => {
  functions.logger.debug("wallet and contracts loading")

  if (!walletKey) {
    functions.logger.error("missing private key", process.env)
    throw new Error("must have a private key")
  }
  const provider = skaleProvider

  const relayWallet = Wallet.createRandom().connect(provider)
  functions.logger.info("Relay address: ", relayWallet.address)

  const delphsWallet = new Wallet(walletKey).connect(provider)
  const delphsAddr = await delphsWallet.getAddress()
  functions.logger.info("Delph's address: ", delphsAddr)

  const sendTx = await delphsWallet.sendTransaction({
    value: utils.parseEther("0.2"),
    to: relayWallet.address,
  })
  functions.logger.info("funded relayer", { tx: sendTx.hash, relayer: relayWallet.address })

  const delphs = delphsContract()
  const player = playerContract()
  const delphsGump = delphsGumpContract()
  const accolades = accoladesContract()
  const teamStats = TeamStats2__factory.connect(addresses().TeamStats2, provider)
  const questTracker = questTrackerContract()
  const trustedForwarder = trustedForwarderContract()
  const listKeeper = listKeeperContract()

  const token = await getBytesAndCreateToken(trustedForwarder, delphsWallet, relayWallet)
  const kasumahRelayer = new KasumahRelayer(trustedForwarder.connect(relayWallet), relayWallet, delphsWallet, token)
  functions.logger.debug("relayer ready")

  return {
    relayer: kasumahRelayer,
    delphsAddress: delphsWallet.address,
    delphs: wrapContract<DelphsTable>(delphs, kasumahRelayer),
    player: wrapContract<Player>(player, kasumahRelayer),
    delphsGump: wrapContract<DelphsGump>(delphsGump, kasumahRelayer),
    accolades: wrapContract<Accolades>(accolades, kasumahRelayer),
    teamStats: wrapContract<TeamStats>(teamStats, kasumahRelayer),
    questTracker: wrapContract<QuestTracker>(questTracker, kasumahRelayer),
    listKeeper: wrapContract<ListKeeper>(listKeeper, kasumahRelayer),
  }
})
