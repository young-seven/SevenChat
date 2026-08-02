import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import { getDatabase } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {  getMessaging,
  isSupported
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-messaging.js";

const firebaseConfig = {
    apiKey: "AIzaSyBG73OlPXIySfaFgklZ92cJGSYpcRWUdvU",
    authDomain: "sevenchat-744.firebaseapp.com",
    projectId: "sevenchat-744",
    storageBucket: "sevenchat-744.firebasestorage.app",
    messagingSenderId: "1074068142185",
    appId: "1:1074068142185:web:37f87aec59bc8f9352caf8"
  };

const app = initializeApp(firebaseConfig);
export { app };
export const auth = getAuth(app);
export const db = getFirestore(app);
export const realtime = getDatabase(
