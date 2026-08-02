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

    // Check whether Firebase Messaging is supported
    const supported = await isSupported();

    if (!supported) {
      console.log("FCM is not supported in this browser.");
      return;
    }

    // Create Firebase Messaging instance
    const messaging = getMessaging(app);

    // Ask for notification permission
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      console.log("Notification permission was not granted.");
      return;
    }

    // Register Firebase Messaging service worker
    const registration =
      await navigator.serviceWorker.register(
        "/SevenChat/firebase-messaging-sw.js"
      );

    console.log("Firebase service worker registered.");

    // Get FCM registration token
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration
    });

    if (token) {
      console.log("🔥 FCM TOKEN RECEIVED");

      // IMPORTANT:
      // Do not display the token publicly.
      // Your backend should store/use this token
      // for sending notifications to this device.
    } else {
      console.log("❌ No FCM token received.");
    }

    // Receive messages while the page is open
    onMessage(messaging, (payload) => {

      console.log("🔔 FCM MESSAGE RECEIVED:", payload);

      const notificationTitle =
        payload.notification?.title || "SevenChat";

      const notificationBody =
        payload.notification?.body || "You have a new message.";

      // Show notification only when permission is granted
      if (Notification.permission === "granted") {

        new Notification(notificationTitle, {
          body: notificationBody,
          icon: "/SevenChat/icon.png"
        });

      }

    });

  } catch (error) {

    console.error(
      "❌ Firebase Messaging error:",
      error
    );

  }

}


// Start notification setup
setupNotifications();
