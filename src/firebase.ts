import { initializeApp } from 'firebase/app';
import { initializeFirestore, collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc, onSnapshot, getDocFromServer } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, setPersistence, browserLocalPersistence } from 'firebase/auth';

import firebaseAppletConfig from '../firebase-applet-config.json';

// In this environment, we use the firebase-applet-config.json if it exists
// Otherwise we'd use environment variables.
let firebaseConfig = firebaseAppletConfig;
const isConfigPlaceholder = !firebaseConfig || !firebaseConfig.apiKey || firebaseConfig.apiKey === "TODO_KEYHERE";

if (isConfigPlaceholder) {
  console.warn("Firebase config not found or contains placeholders, using environment variables");
  firebaseConfig = {
    apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY,
    authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: (import.meta as any).env.VITE_FIREBASE_APP_ID,
    firestoreDatabaseId: (import.meta as any).env.VITE_FIREBASE_DATABASE_ID
  } as any;
}

// Final check before initialization to avoid crash
const hasValidConfig = firebaseConfig && firebaseConfig.apiKey && firebaseConfig.apiKey !== "TODO_KEYHERE";

let app: any;
let db: any;
let auth: any;
let googleProvider: any;

if (hasValidConfig) {
  console.log("Initializing Firebase with valid config");
  app = initializeApp(firebaseConfig);
  
  // Use the provided database ID if it's not the default placeholder
  const dbId = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== "(default)" 
    ? firebaseConfig.firestoreDatabaseId 
    : undefined;
    
  // Use initializeFirestore with experimentalForceLongPolling: true 
  // This often fixes connection issues in restricted environments like iframes.
  db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
  }, dbId);
  
  auth = getAuth(app);
  // Set persistence to local to ensure session survives refreshes in iframes
  setPersistence(auth, browserLocalPersistence).catch(err => console.error("Auth persistence error:", err));
  
  googleProvider = new GoogleAuthProvider();
  // Optional: Force account selection
  googleProvider.setCustomParameters({ prompt: 'select_account' });
} else {
  console.error("Firebase configuration is missing or invalid. Please check your firebase-applet-config.json or environment variables.", firebaseConfig);
}

export { app, auth, googleProvider };

export { signInWithPopup, onAuthStateChanged };
