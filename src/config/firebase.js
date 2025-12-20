import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAEW1YnJ_xm_YnPzW9y1iSmdQIrgOsfjlA",
  authDomain: "carsmongolia-d410a.firebaseapp.com",
  projectId: "carsmongolia-d410a",
  storageBucket: "carsmongolia-d410a.firebasestorage.app",
  messagingSenderId: "483533885994",
  appId: "1:483533885994:web:e6718b4668f1896cf32953",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

export default app;
