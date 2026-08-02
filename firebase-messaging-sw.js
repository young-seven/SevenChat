importScripts(
  "https://www.gstatic.com/firebasejs/12.0.0/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/12.0.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyBG73OlPXIySfaFgklZ92cJGSYpcRWUdvU",
  authDomain: "sevenchat-744.firebaseapp.com",
  projectId: "sevenchat-744",
  storageBucket: "sevenchat-744.firebasestorage.app",
  messagingSenderId: "1074068142185",
  appId: "1:1074068142185:web:37f87aec59bc8f9352caf8"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {

  console.log(
    "[firebase-messaging-sw.js] Background message:",
    payload
  );

  const notificationTitle =
    payload.notification?.title ||
    "SevenChat";

  const notificationOptions = {

    body:
      payload.notification?.body ||
      "You have a new message.",

    icon:
      "/images/avatars/avatar1.png"

  };

  self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );

});