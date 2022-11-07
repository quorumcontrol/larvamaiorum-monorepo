import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getFunctions } from "firebase-admin/functions"

export const app = initializeApp()
export const db = getFirestore(app)
export const appFunctions = getFunctions(app)
