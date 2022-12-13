import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getFunctions } from "firebase-admin/functions"
import { defineString } from "firebase-functions/params";

export const app = initializeApp()
export const db = getFirestore(app)
db.settings({ ignoreUndefinedProperties: true })
export const appFunctions = getFunctions(app)

defineString("NEXT_PUBLIC_MAINNET")
