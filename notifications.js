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

  const box = document.createElement("div");

  box.style.cssText =
    "position:fixed;top:10px;left:10px;right:10px;" +
    "z-index:99999;padding:15px;background:white;" +
    "color:black;border:2px solid green;" +
    "border-radius:10px;font-size:13px;" +
    "word-break:break-all;";

  box.innerHTML =
    "<strong>✅ FCM TOKEN RECEIVED</strong><br><br>" +
    "<strong>Token:</strong><br>" +
    token;

  document.body.appendChild(box);

} else {

  const box = document.createElement("div");

  box.style.cssText =
    "position:fixed;top:10px;left:10px;right:10px;" +
    "z-index:99999;padding:15px;background:white;" +
    "color:red;border:2px solid red;" +
    "border-radius:10px;font-size:14px;";

  box.textContent =
    "❌ NO FCM TOKEN RECEIVED";

  document.body.appendChild(box);
}
