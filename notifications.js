import { app } from "./firebase.js";

import {
  getMessaging,
  isSupported,
  getToken,
  onMessage
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-messaging.js";

const VAPID_KEY =
  "BJoNRtYK6d5sXO3GkuPoKSBrsTvqaWAS1aCCDMCqnMSGVdTfzASPX8zZKGWf3nFeCzNp8V-RY2_-DlWamnSZwR8";

async function setupNotifications() {
  
  try {
    
    const supported = await isSupported();
    
    console.log("FCM SUPPORTED:", supported);
    
    if (!supported) {
      
      console.error(
        "❌ This browser/environment does not support Firebase Cloud Messaging."
      );
      
      return;
    }
    
    const messaging = getMessaging(app);
    
    const permission =
      await Notification.requestPermission();
    
    console.log(
      "NOTIFICATION PERMISSION:",
      permission
    );
    
    if (permission !== "granted") {
      console.log("❌ Notification permission denied");
      return;
    }
    
    const registration =
      await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js"
      );
    
    console.log("✅ SERVICE WORKER REGISTERED");
    
    const token = await getToken(
      messaging,
      {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration
      }
    );
    
    if (token) {
      
      console.log("🔥 FCM TOKEN RECEIVED");
      
    } else {
      
      console.error("❌ NO FCM TOKEN");
      
    }
    
    onMessage(messaging, (payload) => {
      
      console.log(
        "🔔 FOREGROUND MESSAGE:",
        payload
      );
      
    });
    
  }
  
  catch (error) {
    
    console.error(
      "❌ NOTIFICATION SETUP ERROR:",
      error
    );
    
  }
  
}

setupNotifications();