// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics, isSupported } from "firebase/analytics";
import { getFunctions, connectFunctionsEmulator, httpsCallable } from "firebase/functions";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, signInWithCustomToken, connectAuthEmulator } from "firebase/auth";

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
connectFunctionsEmulator(functions, "localhost", 5001);
export const getToken = httpsCallable(functions, 'getToken')

// firebaseApps previously initialized using initializeApp()
export const db = getFirestore();
connectFirestoreEmulator(db, 'localhost', 8080);

export const auth = getAuth();
connectAuthEmulator(auth, "http://localhost:9099");

export function addressToUid(address:string) {
  return `w:${address}`
}

// isSupported().then(() => {
//   getAnalytics(app);
// })
