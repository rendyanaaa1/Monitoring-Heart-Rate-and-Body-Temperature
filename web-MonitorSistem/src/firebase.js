import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// REPLACE WITH YOUR FIREBASE CONFIGURATION
// You can get this from the Firebase Console -> Project Settings -> General -> Your apps
const firebaseConfig = {
  apiKey: "AIzaSyBEzZxClgCziH71M3a3GMZKqj-KmO5r0Vc",
  authDomain: "skripsi-f2451.firebaseapp.com",
  databaseURL: "https://skripsi-f2451-default-rtdb.firebaseio.com/",
  projectId: "skripsi-f2451",
  storageBucket: "skripsi-f2451.firebasestorage.app",
  messagingSenderId: "748632923226",
  appId: "1:748632923226:web:9d525601203499c5364c63"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
