import * as functions from "firebase-functions";
import { TrustedForwarder__factory } from "skale-relayer-contracts/lib/typechain-types";
import { getAuth } from "firebase-admin/auth";
import "./app"
import { addresses } from "../../src/utils/networks";
import { skaleProvider } from "../../src/utils/skaleProvider"

const SESSION_EXPIRY = 43200

const trustedForwarder = TrustedForwarder__factory.connect(addresses().TrustedForwarder, skaleProvider)

// Saves a message to the Firebase Realtime Database but sanitizes the text by removing swearwords.
export const getToken = functions.https.onCall(async (data, context) => {
  functions.logger.debug("request data", data)
  const { relayerAddress, userAddress, token, issuedAt } = data
  
    const isVerified = await trustedForwarder.verify(userAddress, relayerAddress, issuedAt, SESSION_EXPIRY, token)
    if (isVerified) {
      const token = await getAuth().createCustomToken(`w:${userAddress}`)
      functions.logger.debug("authorized", userAddress)
      return {
        firebaseToken: token,
      }
    }
    throw new functions.https.HttpsError("invalid-argument", "unverified account");
});
