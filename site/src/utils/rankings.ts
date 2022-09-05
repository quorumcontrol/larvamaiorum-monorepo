import { BigNumber, constants } from "ethers"
import { DateTime } from 'luxon'
import { wootgumpContract } from "./contracts"
import { defaultNetwork } from "./SkaleChains"
import { skaleProvider } from "./skaleProvider"
import fetch from 'cross-fetch'

type Address = string

interface RankingItem {
  address: Address
  balance: BigNumber
}

interface Checkpoint {
  block: number,
  timestamp: number,
  ranked: RankingItem[]
}

async function getTimestamp(blockNumber:number) {
  const explorerUrl = defaultNetwork().blockExplorers?.default.url
  if (!explorerUrl) {
    throw new Error('missing explorer')
  }
  const body = JSON.stringify({
    query: `{block(number: ${blockNumber}) { timestamp }}`,
    variables: null,
    operationName: null,
  })

  const block = await fetch(`${explorerUrl}graphiql`, {
    method: "POST",
    body: body,
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    }
  })
  const resp = await block.json()
  // console.log("resp: ", resp)
  const { data: { block: { timestamp }}} = resp
  return DateTime.fromISO(timestamp, {locale: 'utc'})
}


export async function rank(from:number):Promise<Checkpoint> {
  const wootgump = wootgumpContract()
    
  const explorerUrl = defaultNetwork().blockExplorers?.default.url
  if (!explorerUrl) {
    throw new Error('missing explorer')
  }

  const filter = wootgump.filters.Transfer(null, null, null)
  
  const startTime = await getTimestamp(from)
  const nextDay = startTime.plus({ days: 1}).toUTC().set({
    hour: 12,
    millisecond: 0,
    minute: 0,
  })

  const closest = await fetch(`${explorerUrl}api?module=block&action=getblocknobytime&timestamp=${nextDay.toSeconds()}&closest=before`, { headers: {accept: "application/json"} })
  const resp = await closest.json()
  // console.log("resp: ", resp)
  const { result: { blockNumber:endBlockNumber } } =resp

  const endBlockTimestamp = await getTimestamp(endBlockNumber)

  const accts:Record<Address,RankingItem> = {}

  const evts = await wootgump.queryFilter(filter, from, parseInt(endBlockNumber, 10))
  evts.forEach((evt) => {
    const existingFrom = accts[evt.args.from] || { address: evt.args.from, balance: constants.Zero}
    existingFrom.balance = existingFrom.balance.sub(evt.args.value)
    accts[evt.args.from] = existingFrom

    const existingTo = accts[evt.args.to] || { address: evt.args.to, balance: constants.Zero}
    existingTo.balance.add(evt.args.value)
    accts[evt.args.to] = existingTo
  })
  return {
    block: parseInt(endBlockNumber, 10),
    timestamp: endBlockTimestamp.toSeconds(),
    ranked: Object.values(accts).sort((a,b) => a.balance.sub(b.balance).toNumber() )
  }
}
