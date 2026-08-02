import { app } from "./firebase.js";

import {
  getMessaging,
  isSupported,
  getToken,
  onMessage
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-messaging.js";

const VAPID_KEY =
  "BJoNRtYK6d5sXO3GkuPoKSBrsTvqaWAS1aCCDMCqnMSGVdTfzASPX8zZKGWf3nFeCzNp8V-RY2_-DlWamnSZwR8";

function showResult(message, color = "green") {
  const box = document.createElement("div");

  box.style.cssText =
    `position:fixed;top:10px;left:10px;right:10px;z-index:99999;` +
    `padding:15px;background:white;color:${color};border:2px solid ${color};` +
    `border-radius:10px;font-size:14px;word-break:break-all;`;

  box.textContent = message;

  document.body.appendChild(box);
}

async function setupNotifications() {

  try {

    showResult("🔄 FCM SETUP STARTED", "blue");

    const supported = await isSupported();

    if (!supported) {
      showResult("❌ FCM NOT SUPPORTED", "red");
      return;
    }

    const messaging = getMessaging(app);

    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      showResult("❌ NOTIFICATION PERMISSION: " + permission, "red");
      return;
    }

    const registration =
      await navigator.serviceWorker.register(
        "/SevenChat/firebase-messaging-sw.js"
      );

    showResult("✅ SERVICE WORKER REGISTERED", "green");

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration
    });

    if (token) {

      showResult(
        "✅ FCM TOKEN RECEIVED\n\n" + token,
        "green"
      );

      onMessage(messaging, (payload) => {
        console.log("🔔 FOREGROUND MESSAGE:", payload);
      });

    } else {

      showResult("❌ NO FCM TOKEN RECEIVED", "red");

    }

  } catch (error) {

    showResult(
      "❌ FCM ERROR:\n\n" +
      error.name +
      "\n\n" +
      error.message,
      "red"
    );

    console.error("FCM ERROR:", error);

  }
}

setupNotifications();
