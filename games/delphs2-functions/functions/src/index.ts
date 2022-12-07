import * as functions from "firebase-functions";
import { undergroundTracks } from "./audius";
import { randomInt } from "crypto"
import { defineString } from "firebase-functions/v2/params";
// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export type ThenArg<T> = T extends PromiseLike<infer U> ? U : T
process.chdir("/tmp");
defineString("SERVICE_COMMANDS_PATH")

export const randomTrack = functions.https.onRequest(async (request, response) => {
  functions.logger.info({ips: request.ips});
  const tracks = await undergroundTracks()
  response.send(JSON.stringify(tracks[randomInt(tracks.length)]));
});
