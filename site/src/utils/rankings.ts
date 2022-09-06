import { BigNumber, constants, utils } from "ethers"
import { DateTime } from 'luxon'
import fetch from 'cross-fetch'
import { wootgumpContract } from "./contracts"
import { defaultNetwork } from "./SkaleChains"
import { memoize } from "./memoize"
import { skaleProvider } from "./skaleProvider"

const TIME_ZONE="utc-12"
const ONE = utils.parseEther('1')

const explorerUrl = memoize(() => {
  const explorerUrl = defaultNetwork().blockExplorers?.default.url
  if (!explorerUrl) {
    throw new Error('missing explorer')
  }
  return explorerUrl
})

const MAX_RANKINGS=500

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

// async function getUTCTimestamp(blockNumber:number) {
//   const body = JSON.stringify({
//     query: `{block(number: ${blockNumber}) { timestamp }}`,
//     variables: null,
//     operationName: null,
//   })

//   const block = await fetch(`${explorerUrl()}graphiql`, {
//     method: "POST",
//     body: body,
//     headers: {
//       accept: "application/json",
//       "content-type": "application/json",
//     }
//   })
//   const resp = await block.json()
//   // console.log("resp: ", resp)
//   const { data: { block: { timestamp }}} = resp
//   return DateTime.fromISO(timestamp, {zone: 'utc'})
// }

async function closestBlockForTime(time:DateTime, beforeOrAfter:'before' | 'after') {
  const resp = await fetch(`${explorerUrl()}api?module=block&action=getblocknobytime&timestamp=${Math.floor(time.toUTC().toSeconds())}&closest=${beforeOrAfter}`, { headers: {accept: "application/json"} })
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

export async function timeRank(time:DateTime, type: 'day' | 'week' | 'month') {
  const cryptoRomeDay = time.setZone(TIME_ZONE)
  const start = cryptoRomeDay.startOf(type)
  const end = cryptoRomeDay.endOf(type)

  const [startBlock, endBlock] = await Promise.all([
    closestBlockForTime(start, 'after'),
    closestBlockForTime(end, 'before'),
  ])
  return rank(startBlock, endBlock)
}


async function rank(from:number, to:number):Promise<Ranking> {
  const wootgump = wootgumpContract()
    
  const filter = wootgump.filters.Transfer(null, null, null)
 
  const accts:Record<Address,RankingItem> = {}

  const evts = await wootgump.queryFilter(filter, from, to)
  console.log('from/to', from, to, 'events: ', evts)
  evts.forEach((evt) => {
    const existingFrom = accts[evt.args.from] || { address: evt.args.from, balance: constants.Zero}
    existingFrom.balance = existingFrom.balance.sub(evt.args.value)
    accts[evt.args.from] = existingFrom

    const existingTo = accts[evt.args.to] || { address: evt.args.to, balance: constants.Zero}
    existingTo.balance = existingTo.balance.add(evt.args.value)
    accts[evt.args.to] = existingTo
  })

  return {
    start: from,
    end: to,
    ranked: Object.values(accts).sort((a,b) => b.balance.sub(a.balance).div(ONE).toNumber() ).slice(0, MAX_RANKINGS)
  }
}
