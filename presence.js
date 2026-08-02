console.log("Presence.js loaded")
// ===============================
// SevenChat Presence System
// Realtime Database
// ===============================

import { auth, realtime } from "./firebase.js";

import {
  ref,
  set,
  onDisconnect,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


// ===============================
// PRESENCE
// ===============================

onAuthStateChanged(auth, async (user) => {
  
  console.log("Presence running", user)
  
  if (!user) return;
  
  
  const userStatusRef =
    ref(realtime, "status/" + user.uid);
  
  
  const onlineData = {
    
    online: true,
    
    lastChanged: serverTimestamp()
    
  };
  
  
  const offlineData = {
    
    online: false,
    
    lastChanged: serverTimestamp()
    
  };
  
  
  // Tell Firebase:
  // if connection disappears,
  // automatically mark offline
  
  onDisconnect(userStatusRef)
    .set(offlineData);
  
  
  // Set online now
  
  await set(
    userStatusRef,
    onlineData
  );
  
  console.log("Presence written successfully")
});