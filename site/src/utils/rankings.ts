import { BigNumber, constants, utils } from "ethers"
import { DateTime } from 'luxon'
import fetch from 'cross-fetch'
import { wootgumpContract } from "./contracts"
import { defaultNetwork } from "./SkaleChains"
import { memoize } from "./memoize"
import { skaleProvider } from "./skaleProvider"

const TIME_ZONE = "utc-12"
const ONE = utils.parseEther('1')

const explorerUrl = memoize(() => {
  const explorerUrl = defaultNetwork().blockExplorers?.default.url
  if (!explorerUrl) {
    throw new Error('missing explorer')
  }
  return explorerUrl
})

const MAX_RANKINGS = 500

type Address = string

interface RankingItem {
  address: Address
  balance: BigNumber
}

interface Ranking {
  start: number,
  end: number,
  ranked: RankingItem[]
}

const IGNORED_ADDRESSES = [
  constants.AddressZero,
  '0x6de3d3747d54d0adc11e5cf678d4045b0441d332',
  '0x218cd18030A5767C6AC9AabA8E2aF84718df0242',
  '0x18c29610E84b43c812D5CE698Dae0c150e078a74',
  '0xb344037f0FC5ce7ebED8D473118FA15E8A24db69',
  '0x0DE468Ca777Cb4e39eb05d227CFdb881d16f422F',
  '0x9e40339d2F81DdefA91ACE2f95C04C897d46FF46',
  '0x9781265d96f91007a714eD39c0CCcaf63f98f533',
  '0xb5EF42d11b48938dDEB468Bf36C384fcefE09B43',
].map((addr) => addr.toLowerCase())

async function closestBlockForTime(time: DateTime, beforeOrAfter: 'before' | 'after') {
  const resp = await fetch(`${explorerUrl()}api?module=block&action=getblocknobytime&timestamp=${Math.floor(time.toUTC().toSeconds())}&closest=${beforeOrAfter}`, { headers: { accept: "application/json" } })
  // console.log("resp: ", resp)
  const parsedResp = await resp.json()
  const { result, message } = parsedResp
  if (message && message === "Block does not exist") {
    if (beforeOrAfter === 'before') {
      return skaleProvider.getBlockNumber()
    }
    throw new Error('you specified a block after a certain time, but it does not exist')
  }
  if (!result || !result.blockNumber) {
    console.error('missing block number: ', parsedResp)
    throw new Error("missing block number in response")
  }
  return parseInt(result.blockNumber, 10)
}

export async function timeRank(time: DateTime, type: 'day' | 'week' | 'month') {
  const cryptoRomeDay = time.setZone(TIME_ZONE)
  const start = cryptoRomeDay.startOf(type)
  const end = cryptoRomeDay.endOf(type)

  const [startBlock, endBlock] = await Promise.all([
    closestBlockForTime(start, 'after'),
    closestBlockForTime(end, 'before'),
  ])
  return rank(startBlock, endBlock)
}

async function rank(from: number, to: number): Promise<Ranking> {
  const wootgump = wootgumpContract()

  const filter = wootgump.filters.Transfer(null, null, null)

  const accts: Record<Address, RankingItem> = {}

  const evts = await wootgump.queryFilter(filter, from, to)
  evts.forEach((evt) => {
    const from = evt.args.from
    const to = evt.args.to
    const value = evt.args.value

    if (!IGNORED_ADDRESSES.includes(from.toLowerCase())) {
      const existingFrom = accts[from] || { address: from, balance: constants.Zero }
      existingFrom.balance = existingFrom.balance.sub(value)
      accts[from] = existingFrom
    }

    if (!IGNORED_ADDRESSES.includes(to.toLowerCase())) {
      const existingTo = accts[to] || { address: to, balance: constants.Zero }
      existingTo.balance = existingTo.balance.add(value)
      accts[to] = existingTo
    }
  })

  return {
    start: from,
    end: to,
    ranked: Object.values(accts).sort((a, b) => b.balance.sub(a.balance).div(ONE).toNumber()).slice(0, MAX_RANKINGS)
  }
}
