import { BigNumber, constants } from 'ethers'
import { DateTime } from 'luxon'
import { accoladesContract, delphsContract, playerContract } from '../src/utils/contracts'
import { closestBlockForTime, playerCount as fetchPlayerCount, startAndEnd, teamStatsContract, TimeFrames } from '../src/utils/rankings'

async function main() {
  const [start,end] = await startBlockEndBlock(DateTime.now(), 'week')
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

  const uniquePlayerStats = stats.reduce((memo, statEvent) => {
    const player = statEvent.args.player
    const team = playersToTeam[player]
    memo[statEvent.args.player] ||= {
      player,
      wootgump: constants.Zero,
      games: 0,
      team
    }

    memo[player].wootgump = memo[player].wootgump.add(statEvent.args.value)
    memo[player].games += 1

    return memo
  }, {} as Record<string,{ player: string, wootgump: BigNumber, games: number, team: BigNumber}>)
  console.log('fetch accolades')
  const accolades = await fetchAccolades(start, end)

  console.log('fetch games')
  const games = await fetchGames(start, end)

  const humanCount = Object.values(uniquePlayerStats).filter((up) => !up.team.eq(constants.Zero)).length

  const battleCount = accolades.filter((transfer) => transfer.args.id.eq(5)).length
  const playerGames = Object.values(uniquePlayerStats).filter((up) => !up.team.eq(constants.Zero)).reduce((memo, stats) => {
    return (memo += stats.games)
  }, 0)

  console.log({
    uniquePlayers: humanCount,
    battles: battleCount,
    playerGames: playerGames,
    games: games.length,
  })
}

async function startBlockEndBlock(time:DateTime, period:TimeFrames) {
  const [start,end] = startAndEnd(DateTime.now(), 'week')
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

async function fetchAccolades(start:number, end:number) {
  const accolades = accoladesContract()
  const filter = accolades.filters.TransferSingle(null, null, null, null, null)
  return accolades.queryFilter(filter, start, end)
}

async function fetchGames(start:number, end:number) {
  const delphs = delphsContract()
  const filter = delphs.filters.Started(null, null)
  return delphs.queryFilter(filter, start, end)
}

main().then(() => {
  console.log('done')
}).catch((err) => {
  console.error('err: ', err)
})