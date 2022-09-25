import { BigNumber, constants, providers, utils, Wallet } from 'ethers'
import { DateTime } from 'luxon'
import { IERC20__factory } from '../contracts/typechain'
import { badgeOfAssemblyContract, playerContract } from '../src/utils/contracts'
import { closestBlockForTime, startAndEnd, teamStatsContract, TimeFrames } from '../src/utils/rankings'
import SimpleSyncher from '../src/utils/singletonQueue'
import dotenv from 'dotenv'

dotenv.config()

const ONE = utils.parseEther('1')

const prizes = [8000, 5000, 2000].map((prize) => utils.parseEther(prize.toString()))

const rubySklAddress = '0xE0595a049d02b7674572b0d59cd4880Db60EDC50'
const europaProvider = new providers.JsonRpcProvider('https://mainnet.skalenodes.com/v1/elated-tan-skat')

const txSingleton = new SimpleSyncher('team transactions')

if (!process.env.PRIZE_PAYER_PRIVATE_KEY) {
  throw new Error('no prize payer')
}

const prizeSigner = new Wallet(process.env.PRIZE_PAYER_PRIVATE_KEY).connect(europaProvider)
const sklContract = IERC20__factory.connect(rubySklAddress, prizeSigner)

async function main() {
  const [start,end] = await startBlockEndBlock(DateTime.now().minus({weeks: 2}), 'week')
  console.log('fetching stats')
  const stats = await fetchTeamStats(start, end)

  const uniquePlayers = Object.keys(stats.reduce((memo, statEvent) => {
    memo[statEvent.args.player] = true
    return memo
  }, {}))

  const teams = await Promise.all(uniquePlayers.map(async (address) => {
    return playerContract().team(address)
  }))

  const playersToTeam = uniquePlayers.reduce((memo, addr, i) => {
    memo[addr] = teams[i]
    return memo
  }, {} as Record<string,BigNumber>)

  const playerAndTeamStats = stats.reduce((memo, statEvent) => {
    const player = statEvent.args.player
    const team = playersToTeam[player]

    const key = team.toString()
    memo[key] ||= {
      players: new Set<string>(),
      wootgump: constants.Zero,
      team
    }

    memo[key].wootgump = memo[key].wootgump.add(statEvent.args.value)
    memo[key].players.add(statEvent.args.player)

    return memo
  }, {} as Record<string,{ players: Set<string>, wootgump: BigNumber, team: BigNumber}>)

  const sorted = Object.values(playerAndTeamStats).sort((a,b) => b.wootgump.sub(a.wootgump).div(ONE).toNumber())

  const winningTeams = sorted.filter((team) => !team.team.eq(constants.Zero)).slice(0,3)
  
  const names = await Promise.all(winningTeams.map(async (team) => {
    const meta = await badgeOfAssemblyContract().metadata(team.team)
    return meta.name
  }))



  console.log(winningTeams.map((team, i) => {
    return {
      team: names[i],
      gump: utils.formatEther(team.wootgump),
      playerCount: team.players.size,
    }
  }))

  for (let i = 0; i < 3; i++) {
    console.log('team: ', names[i])
    const team = winningTeams[i]
    const payout = prizes[i].div(team.players.size)
    const players = Array.from(team.players.values())
    await Promise.all(players.map((player) => {
      return txSingleton.push(async () => {
        console.log('send: ', utils.formatEther(payout), ' to: ', player)
        // const tx = await sklContract.transfer(player, payout, { gasLimit: 250_000 })
        // console.log('tx: ', tx.hash)
        // return tx.wait()
      })
    }))
  }
}

async function startBlockEndBlock(time:DateTime, period:TimeFrames) {
  const [start,end] = startAndEnd(time, 'week')
  const [startBlock, endBlock] = await Promise.all([
    closestBlockForTime(start, 'after'),
    closestBlockForTime(end, 'before'),
  ])
  return [startBlock,endBlock]
}

async function fetchTeamStats(start:number, end:number) {
  const teamStats = teamStatsContract()
  const filter = teamStats.filters.TeamWin(null, null, null, null)
  return teamStats.queryFilter(filter, start, end)
}

main().then(() => {
  console.log('done')
}).catch((err) => {
  console.error('err: ', err)
})