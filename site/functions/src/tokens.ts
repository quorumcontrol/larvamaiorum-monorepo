import * as functions from "firebase-functions";
import { TrustedForwarder__factory } from "skale-relayer-contracts/lib/typechain-types";
import { getAuth } from "firebase-admin/auth";
import "./app"
import { addresses } from "../../src/utils/networks";
import { skaleProvider } from "../../src/utils/skaleProvider"
import { backOff } from "exponential-backoff";

const SESSION_EXPIRY = 43200

const trustedForwarder = TrustedForwarder__factory.connect(addresses().TrustedForwarder, skaleProvider)

// Saves a message to the Firebase Realtime Database but sanitizes the text by removing swearwords.
export const getToken = functions.https.onCall(async (data, context) => {
  functions.logger.debug("request data", data)
  const { relayerAddress, userAddress, token, issuedAt } = data
  try {
    const isVerified = await backOff(async () => {
      return await trustedForwarder.verify(userAddress, relayerAddress, issuedAt, SESSION_EXPIRY, token)
    }, {
      numOfAttempts: 5,
      startingDelay: 1000,
      maxDelay: 2000,
    })
    if (isVerified) {
      const token = await getAuth().createCustomToken(`w:${userAddress}`)
      functions.logger.debug("authorized", userAddress)
      return {
        firebaseToken: token,
      }
    }
  } catch (err) {
    functions.logger.error("unsolvable problem, restarting the process", err)
    process.exit(1)
  }
  throw new functions.https.HttpsError("invalid-argument", "unverified account");

});
