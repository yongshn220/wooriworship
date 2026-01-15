import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/storage";
import { getApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";


// https://firebase.google.com/docs/web/setup#available-libraries


const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  databaseId: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID, // Experimental: Try passing it in config
};

export const firebaseApp = firebase.initializeApp(firebaseConfig);
const dbId = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID;
console.log("🔥 Configured DB ID:", dbId);

// Standard Modular Initialization for Named DB
if (dbId && dbId !== "(default)") {
  try {
    const modularApp = getApp(); // Get the modular app instance corresponding to the default app
    initializeFirestore(modularApp, {}, dbId);
    console.log(`🔥 Initialized Modular Firestore with DB ID: ${dbId}`);
  } catch (e) {
    console.error("🔥 Failed to initialize Modular Firestore:", e);
  }
}

export const firestore = firebaseApp.firestore();
// Diagnostic Log
console.log("🔥 Actual Firestore DB ID (internal):", (firestore as any)._databaseId?.database);
export const storage = firebase.storage();
export const auth = firebase.auth();
