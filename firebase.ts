import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/storage";


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

export const firestore = (dbId && dbId !== "(default)")
  ? (firebaseApp as any).firestore(dbId)
  : firebase.firestore();

console.log("🔥 Actual Firestore DB ID (internal):", (firestore as any)._databaseId?.database);
console.log("🔥 Delegate DB ID:", (firestore as any)._delegate?._databaseId?.database);
console.log("🔥 Delegate Settings:", (firestore as any)._delegate?._settings);
export const storage = firebase.storage();
export const auth = firebase.auth();
