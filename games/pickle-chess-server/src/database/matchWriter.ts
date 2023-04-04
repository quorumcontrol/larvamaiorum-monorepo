import { Databases, ID, Models, AppwriteException } from "node-appwrite"
import client from "./appwrite";

const DATABASE_ID = "642ae0350a2d4ab93cad"
const MATCH_COLLECTION = "642ae03a0f1c09ae3f8a"
const PLAYER_COLLECTION = "642be791ddb0b0c5c29d"

type PlayerDoc = Models.Document & {
  address: string
  wins: number
  levelup_wins: number
}

export const createMatch = async (players: string[]): Promise<string> => {
  const databases = new Databases(client);
  try {
    const id = ID.unique()
    const resp = await databases.createDocument(
      DATABASE_ID,
      MATCH_COLLECTION,
      id,
      {
        players,
        startTime: new Date(),
      }
    )
    console.log("resp: ", resp)
    return resp.$id
  } catch (err) {
    console.error("err: ", err)
    throw err
  }
}

// TODO: not sure about this data here.
export const setWinner = async (matchId: string, winner: string): Promise<void> => {
  const databases = new Databases(client);
  try {
    const playerDoc = await playerDocument(winner)

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
        {
          wins: playerDoc.wins + 1,
          levelup_wins: playerDoc.levelup_wins + 1,
        }
      )
    ])
    console.log("resps: ", resps)
    return
  } catch (err) {
    console.error("err: ", err)
    throw err
  }
}

export const playerLevel = async (player: string): Promise<{ level: number, nextLevelIn: number }> => {
  const currentWins = await playerWins(player);
  const currentLevel = Math.floor(Math.log(currentWins + 1));

  // Calculate the number of wins required for the next level
  const nextLevelWins = Math.ceil(Math.exp(currentLevel + 1)) - 1;

  // Calculate the remaining wins needed for the next level
  const remainingWins = nextLevelWins - currentWins;

  return {
    level: currentLevel,
    nextLevelIn: remainingWins,
  };
}

export const playerWins = async (player: string): Promise<number> => {
  const playerDoc = await playerDocument(player)
  return playerDoc.levelup_wins
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
  } catch (err:any) {
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
