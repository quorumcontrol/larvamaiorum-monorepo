import { BigNumber, BigNumberish, constants, utils } from "ethers"
import { DateTime } from 'luxon'
import fetch from 'cross-fetch'
import { accoladesContract, wootgumpContract } from "./contracts"
import { defaultNetwork } from "./SkaleChains"
import { memoize } from "./memoize"
import { skaleProvider } from "./skaleProvider"
import multicallWrapper from "./multicallWrapper"
import { TeamStats, TeamStats__factory } from "../../contracts/typechain"
import { addresses } from "./networks"
import { questTrackerContract } from "./questTracker"
import { keccak256 } from "ethers/lib/utils"

const TIME_ZONE = "utc-12"
const ONE = utils.parseEther('1')

export type TimeFrames = 'day' | 'week'
export type LeaderBoardType = 'gump' | 'team' | 'mostgump' | 'firstgump' | 'firstblood' | 'battleswon' | 'battlesPerGame'

const explorerUrl = memoize(() => {
  const explorerUrl = defaultNetwork().blockExplorers?.default.url
  if (!explorerUrl) {
    throw new Error('missing explorer')
  }
  return explorerUrl
})

const MAX_RANKINGS = 500

type Address = string

type RankingItem = GumpRankingItem | TeamRankingItem

interface GumpRankingItem {
  address: Address
  team?: never
  balance: BigNumber
}

interface TeamRankingItem {
  team: number
  address?: never
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

export const teamStatsContract = memoize(() => {
  const multiCall = multicallWrapper(skaleProvider);
  const unwrapped = TeamStats__factory.connect(addresses().TeamStats, skaleProvider);
  return multiCall.syncWrap<TeamStats>(unwrapped);
});

export async function closestBlockForTime(time: DateTime, beforeOrAfter: 'before' | 'after') {
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

export function startAndEnd(time: DateTime, timePeriod: TimeFrames) {
  const cryptoRomeDay = time.setZone(TIME_ZONE)
  let start = cryptoRomeDay.startOf('day')
  let end = cryptoRomeDay.endOf('day')
  if (timePeriod === 'day') {
    return [start, end]
  }

  while (start.weekday !== 3) {
    start = start.minus({ days: 1 })
  }

  end = end.plus({ day: 1 })
  while (end.weekday !== 3) {
    end = end.plus({ day: 1 })
  }

  return [start, end]
}

export async function timeRank(time: DateTime, type: LeaderBoardType, timePeriod: TimeFrames) {
  let [start, end] = startAndEnd(time, timePeriod)

  if (end.diffNow('seconds').seconds > 0) {
    end = DateTime.now().setZone(TIME_ZONE).toUTC()
  }

  const [startBlock, endBlock] = await Promise.all([
    closestBlockForTime(start, 'after'),
    closestBlockForTime(end, 'before'),
  ])
  switch (type) {
    case 'gump':
      return rank(startBlock, endBlock)
    case 'team':
      return teamRank(startBlock, endBlock)
    case 'mostgump':
      return mostGump(startBlock, endBlock)
    case 'firstgump':
      return accoladesCount(startBlock, endBlock, 3)
    case 'firstblood':
      return accoladesCount(startBlock, endBlock, 4)
    case 'battleswon':
      return accoladesCount(startBlock, endBlock, 5)
    case 'battlesPerGame':
      return battlesWonPerGame(startBlock, endBlock)
  }
}

export const playerCount = async (time: DateTime, timePeriod: TimeFrames) => {
  const [start, end] = startAndEnd(time, timePeriod)

  const [startBlock, endBlock] = await Promise.all([
    closestBlockForTime(start, 'after'),
    closestBlockForTime(end, 'before'),
  ])
  const teamStats = teamStatsContract()
  const filter = teamStats.filters.TeamWin(null, null, null, null)
  const evts = await teamStats.queryFilter(filter, startBlock, endBlock)
  const uniquePlayers = evts.reduce((memo, evt) => {
    if (evt.args.team.eq(constants.Zero)) {
      return memo
    }
    return {
      ...memo,
      [evt.args.player]: true
    }
  }, {})
  return Object.keys(uniquePlayers).length
}

async function teamRank(from: number, to: number): Promise<Ranking> {
  const teamStats = teamStatsContract()
  const filter = teamStats.filters.TeamWin(null, null, null, null)
  const evts = await teamStats.queryFilter(filter, from, to)
  const teams: Record<number, TeamRankingItem> = {}
  evts.forEach((evt) => {
    if (evt.args.team.eq(constants.Zero)) {
      return
    }
    const existingTeam = teams[evt.args.team.toNumber()] || { team: evt.args.team.toNumber(), balance: constants.Zero }
    existingTeam.balance = existingTeam.balance.add(evt.args.value)
    teams[evt.args.team.toNumber()] = existingTeam
  })
  return {
    start: from,
    end: to,
    ranked: Object.values(teams).sort((a, b) => b.balance.sub(a.balance).div(ONE).toNumber()).slice(0, MAX_RANKINGS)
  }
}

async function accoladesCount(from: number, to: number, tokenId: BigNumberish) {
  const accolades = accoladesContract()
  const filter = accolades.filters.TransferSingle(null, constants.AddressZero, null, null, null)
  const evts = await accolades.queryFilter(filter, from, to)
  let ranked: Record<string, GumpRankingItem> = {}
  evts.filter((evt) => evt.args.id.eq(tokenId)).forEach((evt) => {
    ranked[evt.args.to] ||= { address: evt.args.to, balance: constants.Zero }
    ranked[evt.args.to].balance = ranked[evt.args.to].balance.add(evt.args.value.mul(ONE))
  })
  return {
    start: from,
    end: to,
    ranked: Object.values(ranked).sort((a, b) => b.balance.sub(a.balance).div(ONE).toNumber()).slice(0, MAX_RANKINGS)
  }
}

async function battlesWonPerGame(from: number, to: number) {
  const questTracker = questTrackerContract()
  const filter = questTracker.filters.QuestTrack(null, null, keccak256(Buffer.from('battles-won')), null, null)
  const evts = await questTracker.queryFilter(filter, from, to)
  let ranked: GumpRankingItem[] = evts.map((evt) => {
    return {
      address: evt.args.player,
      balance: evt.args.value.mul(ONE),
    }
  }).sort((a, b) => b.balance.sub(a.balance).div(ONE).toNumber())
    .slice(0, MAX_RANKINGS)
  return {
    start: from,
    end: to,
    ranked: Object.values(ranked).sort((a, b) => b.balance.sub(a.balance).div(ONE).toNumber()).slice(0, MAX_RANKINGS)
  }
}

async function mostGump(from: number, to: number): Promise<Ranking> {
  const teamStats = teamStatsContract()
  const filter = teamStats.filters.TeamWin(null, null, null, null)
  const evts = await teamStats.queryFilter(filter, from, to)
  const ranked: GumpRankingItem[] = evts.map((evt) => {
    return {
      address: evt.args.player,
      balance: evt.args.value,
    }
  })
    .sort((a, b) => b.balance.sub(a.balance).div(ONE).toNumber())
    .slice(0, MAX_RANKINGS)

  return {
    start: from,
    end: to,
    ranked
  }
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
