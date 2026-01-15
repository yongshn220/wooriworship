import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize App (Singleton Pattern)
export const firebaseApp = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApp();

// Database Selection Logic
const dbId = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID;
console.log("🔥 Configured DB ID:", dbId);

// Initialize Modular Firestore
export const db = (dbId && dbId !== "(default)")
  ? initializeFirestore(firebaseApp, {}, dbId)
  : getFirestore(firebaseApp);

console.log(`🔥 Initialized Modular Firestore with DB ID: ${dbId || "(default)"}`);
// Check internal ID if accessible (for debugging, though properties are private in Modular SDK)
// console.log("🔥 Actual DB ID:", (db as any)._databaseId);

export const storage = getStorage(firebaseApp);
export const auth = getAuth(firebaseApp);
