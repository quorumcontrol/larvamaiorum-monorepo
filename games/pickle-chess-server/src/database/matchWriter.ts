import { Databases, ID } from "node-appwrite"
import client from "./appwrite";

const DATABASE_ID = "642ae0350a2d4ab93cad"
const MATCH_COLLECTION = "642ae03a0f1c09ae3f8a"

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

export const setWinner = async(matchId: string, winner: string): Promise<void> => {
  const databases = new Databases(client);
  try {
    const resp = await databases.updateDocument(
      DATABASE_ID,
      MATCH_COLLECTION,
      matchId,
      {
        winner,
        endTime: new Date(),
      }
    )
    console.log("resp: ", resp)
    return
  } catch (err) {
    console.error("err: ", err)
    throw err
  }
}