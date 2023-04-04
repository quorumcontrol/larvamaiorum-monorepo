import { Databases, ID, Models, Query } from "node-appwrite"
import client from "./appwrite";

const DATABASE_ID = "642ae0350a2d4ab93cad"
const MATCH_COLLECTION = "642ae03a0f1c09ae3f8a"
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
        Query.greaterThan("$createdAt", today.toISOString()),
        Query.equal("player", player),
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

const updateLevelMatchDoc = async (matchId:string, winner:string) => {
  const databases = new Databases(client);
  try {
    const matches = await databases.listDocuments(
      DATABASE_ID,
      LEVEL_MATCH_COLLECTION,
      [
        Query.equal("match_id", matchId),
        Query.equal("player", winner),
      ]
    )
    console.log("matches: ", matches)
    if (matches.total === 0) {
      throw new Error("could not find match")
    }
    const matchDoc = matches.documents[0]
    return databases.updateDocument(
      DATABASE_ID,
      LEVEL_MATCH_COLLECTION,
      matchDoc.$id,
      {
        winner: true,
      },
    )
  } catch (err) {
    console.error("err: ", err)
    throw err
  }
}

export const createMatch = async (players: string[]): Promise<string> => {
  const databases = new Databases(client);
  try {
    const matchDoc = await databases.createDocument(
      DATABASE_ID,
      MATCH_COLLECTION,
      ID.unique(),
      {
        players,
        startTime: new Date(),
      }
    )
    await Promise.all(players.map(async (player) => {
      return databases.createDocument(
        DATABASE_ID,
        LEVEL_MATCH_COLLECTION,
        ID.unique(),
        {
          match_id: matchDoc.$id,
          player: player,
        }
      )
    }))
    console.log("resp: ", matchDoc)
    return matchDoc.$id
  } catch (err) {
    console.error("err: ", err)
    throw err
  }
}


// TODO: not sure about this data here.
export const setWinner = async (matchId: string, winner: string): Promise<void> => {
  const databases = new Databases(client);
  try {
    const [playerDoc, [todaysPlays, _todaysWins]] = await Promise.all([
      playerDocument(winner),
      playsToday(winner),
    ])

    const playerUpdateDoc:Partial<PlayerDoc> = {
      wins: playerDoc.wins + 1,
    }

    if (todaysPlays < MAX_LEVELING_GAMES_PER_DAY) {
      playerUpdateDoc.levelup_wins = playerDoc.levelup_wins + 1
    }

    const resps = await Promise.all([
      databases.updateDocument(
        DATABASE_ID,
        MATCH_COLLECTION,
        matchId,
        {
          winner,
          endTime: new Date(),
        }
      ),
      databases.updateDocument(
        DATABASE_ID,
        PLAYER_COLLECTION,
        playerDoc.$id,
        playerUpdateDoc
      ),
      updateLevelMatchDoc(matchId, winner),
    ])
    console.log("resps: ", resps)
    return
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

export const playerDetail = async (playerAddress: string): Promise<PlayerDetails> => {
  const [player, [todaysGames, todaysWins]] = await Promise.all([
    playerDocument(playerAddress),
    playsToday(playerAddress)
  ])
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

const playerDocument = async (player: string): Promise<PlayerDoc> => {
  const databases = new Databases(client);
  try {
    const doc = await databases.getDocument<PlayerDoc>(DATABASE_ID, PLAYER_COLLECTION, addressToDocId(player))
    console.log("doc: ", doc)
    return doc
  } catch (err: any) {
    if (err.code === 404) {
      const doc = await databases.createDocument<PlayerDoc>(
        DATABASE_ID,
        PLAYER_COLLECTION,
        addressToDocId(player),
        {
          address: player.toLowerCase(),
        }
      )
      return doc
    }
    throw err
  }
}
