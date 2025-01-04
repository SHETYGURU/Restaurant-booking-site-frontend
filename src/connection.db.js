import { initializeApp, getApps } from "firebase/app";
import { getDatabase } from "firebase/database";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAiS9M6yQJKmzERVg0WGsr4yjvJyqneKug",
  authDomain: "neina-8cf29.firebaseapp.com",
  databaseURL: "https://neina-8cf29-default-rtdb.firebaseio.com",
  projectId: "neina-8cf29",
  storageBucket: "neina-8cf29.appspot.com",
  messagingSenderId: "484985941219",
  appId: "1:484985941219:web:be307a2fdc946ef2b229d6",
  measurementId: "G-MBMG5W2ZPV"
};

// Initialize Firebase App only if it's not already initialized
  if (getApps().length === 0) {
    initializeApp(firebaseConfig);
  }

export const realtimeDb = getDatabase();  // Correct export
