import * as functions from "firebase-functions";
import { undergroundTracks } from "./audius";
import { randomInt } from "crypto"
// Start writing functions
// https://firebase.google.com/docs/functions/typescript

export const randomTrack = functions.https.onRequest(async (request, response) => {
  functions.logger.info("Hello logs!", {structuredData: true});
  const tracks = await undergroundTracks()
  response.send(JSON.stringify(tracks[randomInt(tracks.length)]));
});
