import { Databases, ID, Models, Query } from "appwrite"
import { useQuery } from "react-query";
import client from "../utils/appwrite";

const DATABASE_ID = "642ae0350a2d4ab93cad"
const PLAYER_COLLECTION = "642be791ddb0b0c5c29d"
const LEVEL_MATCH_COLLECTION = "642c04490913ec6c43a6"

const MAX_LEVELING_GAMES_PER_DAY = 4

type PlayerDoc = Models.Document & {
  address: string
  wins: number
  levelup_wins: number
}

type MatchLevelDoc = Models.Document & {
  player: string,
  winner: boolean,
}

const playsToday = async (player: string): Promise<[number, number]> => {
  const databases = new Databases(client);
  try {
    const today = new Date(new Date().toUTCString())
    today.setHours(0, 0, 0, 0)
    const matches = await databases.listDocuments<MatchLevelDoc>(
      DATABASE_ID,
      LEVEL_MATCH_COLLECTION,
      [
        Query.equal("player", player),
        Query.greaterThan("$createdAt", today.toISOString()),
        Query.limit(0),
      ]
    )
    const wins = await databases.listDocuments<MatchLevelDoc>(
      DATABASE_ID,
      LEVEL_MATCH_COLLECTION,
      [
        Query.equal("player", player),
        Query.greaterThan("$createdAt", today.toISOString()),
        Query.equal("winner", true),
        Query.limit(0),
      ]
    )
    console.log("matches: ", matches)
    return [matches.total, wins.total]
  } catch (err) {
    console.error("err: ", err)
    throw err
  }
}

export interface PlayerDetails {
  level: number,
  nextLevelIn: number,
  wins: number,
  levelupWins: number,
  todaysGames: number,
  todaysWins: number,
  maxPerDay: number,
}

const playerDetail = async (playerAddress: string): Promise<PlayerDetails|undefined> => {
  const [player, [todaysGames, todaysWins]] = await Promise.all([
    playerDocument(playerAddress),
    playsToday(playerAddress)
  ])
  if (!player) {
    return {
      level: 0,
      nextLevelIn: 2,
      wins: 0,
      levelupWins: 0,
      todaysGames,
      todaysWins,
      maxPerDay: MAX_LEVELING_GAMES_PER_DAY,
    }
  }
  console.log("player", player, todaysGames, todaysWins)
  const currentWins = player.levelup_wins
  const currentLevel = Math.floor(Math.log(currentWins + 1));

  // Calculate the number of wins required for the next level
  const nextLevelWins = Math.ceil(Math.exp(currentLevel + 1)) - 1;

  // Calculate the remaining wins needed for the next level
  const remainingWins = nextLevelWins - currentWins;

  return {
    level: currentLevel,
    nextLevelIn: remainingWins,
    wins: player.wins,
    levelupWins: currentWins,
    todaysGames,
    todaysWins,
    maxPerDay: MAX_LEVELING_GAMES_PER_DAY,
  };
}

const addressToDocId = (address: string): string => {
  if (address.startsWith("0x")) {
    return ID.custom(address.slice(2, 38).toLowerCase())
  }
  return ID.custom(address.slice(0, 36).toLowerCase())
}

const playerDocument = async (player: string): Promise<PlayerDoc|undefined> => {
  const databases = new Databases(client);
  try {
    const doc = await databases.getDocument<PlayerDoc>(DATABASE_ID, PLAYER_COLLECTION, addressToDocId(player))
    console.log("doc: ", doc)
    return doc
  } catch (err: any) {
    if (err.code === 404) {
      return undefined
    }
    throw err
  }
}

export const usePlayerDetails = (playerAddress?: string) => {
  return useQuery(["player-metagame", playerAddress], () => {
    return playerDetail(playerAddress!)
  }, {
    enabled: !!playerAddress,
  })
}