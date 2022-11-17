// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics, isSupported } from "firebase/analytics";
import { getFunctions, connectFunctionsEmulator, httpsCallable } from "firebase/functions";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_apiKey,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_authDomain,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_projectId,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_storageBucket,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_messagingSenderId,
  appId: process.env.NEXT_PUBLIC_FIREBASE_appId,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_measurementId,
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

export const functions = getFunctions(app);
export const getToken = httpsCallable(functions, 'getToken')
export const faucet = httpsCallable<{ relayerAddress:string, userAddress:string, token:string, issuedAt:number }, {message:string, transactionId?:string}>(functions, 'faucet')

// firebaseApps previously initialized using initializeApp()
export const db = getFirestore();

export const auth = getAuth();

export function addressToUid(address:string) {
  return `w:${address}`
}

if (process.env.NEXT_PUBLIC_FIREBASE_EMULATORS) {
  connectFunctionsEmulator(functions, "localhost", 5001);
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectAuthEmulator(auth, "http://localhost:9099");
}

const regExp = /w:(.+)/
export function uidToAddress(uid:string) {
  const matches = uid.match(regExp)
  if (!matches || !matches[1]) {
    throw new Error('not a uid')
  }
  return matches[1]
}

// isSupported().then(() => {
//   getAnalytics(app);
// })
