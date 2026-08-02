// ===============================
// SevenChat v2.3
// chat.js
// ===============================

console.log("🔥 CHAT.JS IS RUNNING");

import { auth, db } from "./firebase.js";

import {
  collection,
  doc,
  query,
  orderBy,
  getDoc,
  onSnapshot,
  addDoc,
  updateDoc,
  serverTimestamp,
  increment
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
  getDatabase,
  ref,
  onValue
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";


// ===============================
// DOM
// ===============================

const messagesBox =
  document.getElementById("messages");

const messageInput =
  document.getElementById("messageInput");

const sendBtn =
  document.getElementById("sendBtn");

const profileName =
  document.getElementById("profileName");

const profilePic =
  document.getElementById("profilePic");

const profileBio =
  document.getElementById("profileBio");

const typingStatus =
  document.getElementById("typingStatus");

const statusElement =
  document.getElementById("status");


// ===============================
// VARIABLES
// ===============================

let currentUser = null;

let otherUserId = null;

let typingTimer = null;

let isSending = false;

const realtimeDB = getDatabase();


// ===============================
// CHAT ID
// ===============================

const params =
  new URLSearchParams(window.location.search);

const chatId =
  params.get("chatId");


if (!chatId) {

  alert("No chat selected");

  window.location.href =
    "home.html";

}


// ===============================
// AUTH
// ===============================

onAuthStateChanged(
  auth,
  async (user) => {

    if (!user) {

      window.location.href =
        "login.html";

      return;

    }

    currentUser = user;

    console.log(
      "AUTH USER:",
      currentUser.uid
    );

    await initializeChat();

  }
);


// ===============================
// INITIALIZE CHAT
// ===============================

async function initializeChat() {

  try {

    console.log(
      "INITIALIZING CHAT:",
      chatId
    );


    const chatRef =
      doc(
        db,
        "chats",
        chatId
      );


    const chatSnap =
      await getDoc(chatRef);


    console.log(
      "CHAT EXISTS:",
      chatSnap.exists()
    );


    if (!chatSnap.exists()) {

      alert("Chat not found");

      window.location.href =
        "home.html";

      return;

    }


    const chatData =
      chatSnap.data();


    console.log(
      "CHAT DATA:",
      chatData
    );


    // ===============================
    // FIND OTHER USER
    // ===============================

    otherUserId =
      Object.keys(
        chatData.participants
      ).find(
        uid =>
          uid !== currentUser.uid
      );
// ===============================
// MARK CHAT AS READ
// ===============================

await updateDoc(
  doc(
    db,
    "chats",
    chatId
  ),
  {
    [`unread.${currentUser.uid}`]: 0
  }
);

console.log(
  "UNREAD COUNT RESET FOR:",
  currentUser.uid
);

    console.log(
      "OTHER USER:",
      otherUserId
    );


    if (!otherUserId) {

      console.error(
        "OTHER USER NOT FOUND"
      );

      return;

    }


    // ===============================
    // START LISTENERS
    // ===============================

    loadProfile();

    listenForMessages();

    listenTyping();

  }

  catch (error) {

    console.error(
      "INITIALIZE CHAT ERROR:",
      error
    );

  }

}


// ===============================
// LOAD PROFILE
// ===============================

function loadProfile() {

  console.log(
    "LOADING PROFILE:",
    otherUserId
  );


  // ===============================
  // FIRESTORE PROFILE
  // ===============================

  const userRef =
    doc(
      db,
      "users",
      otherUserId
    );


  onSnapshot(
    userRef,
    (snapshot) => {

      if (!snapshot.exists()) {

        console.log(
          "PROFILE DOES NOT EXIST"
        );

        return;

      }


      const userData =
        snapshot.data();


      profileName.textContent =
        userData.username ||
        userData.name ||
        "Unknown User";


      profileBio.textContent =
        userData.bio ||
        "No bio yet";


      profilePic.src =
        `images/avatars/${
          userData.avatar ||
          "avatar1.png"
        }`;

    },

    (error) => {

      console.error(
        "PROFILE LISTENER ERROR:",
        error
      );

    }
  );


  // ===============================
  // REALTIME DATABASE PRESENCE
  // ===============================

  const statusRef =
    ref(
      realtimeDB,
      `status/${otherUserId}`
    );


  onValue(
    statusRef,
    (snapshot) => {

      const presenceData =
        snapshot.val();


      console.log(
        "OTHER USER PRESENCE:",
        presenceData
      );


      // ===============================
      // ONLINE
      // ===============================

      if (
        presenceData &&
        presenceData.online === true
      ) {

        statusElement.textContent =
          "🟢 Online";

        return;

      }


      // ===============================
      // OFFLINE / LAST SEEN
      // ===============================

      if (
        presenceData &&
        presenceData.lastChanged
      ) {

        const lastSeen =
          presenceData.lastChanged;


        const now =
          Date.now();


        const difference =
          now - lastSeen;


        const seconds =
          Math.floor(
            difference / 1000
          );


        const minutes =
          Math.floor(
            seconds / 60
          );


        const hours =
          Math.floor(
            minutes / 60
          );


        const days =
          Math.floor(
            hours / 24
          );


        if (seconds < 60) {

          statusElement.textContent =
            "⚪ Last seen just now";

        }

        else if (minutes < 60) {

          statusElement.textContent =
            `⚪ Last seen ${minutes} ${
              minutes === 1
                ? "minute"
                : "minutes"
            } ago`;

        }

        else if (hours < 24) {

          statusElement.textContent =
            `⚪ Last seen ${hours} ${
              hours === 1
                ? "hour"
                : "hours"
            } ago`;

        }

        else {

          statusElement.textContent =
            `⚪ Last seen ${days} ${
              days === 1
                ? "day"
                : "days"
            } ago`;

        }

      }

      else {

        statusElement.textContent =
          "⚪ Last seen unavailable";

      }

    },

    (error) => {

      console.error(
        "PRESENCE LISTENER ERROR:",
        error
      );

    }
  );

}


// ===============================
// LISTEN FOR MESSAGES
// ===============================

function listenForMessages() {

  console.log(
    "LISTENING FOR MESSAGES"
  );


  const messagesQuery =
    query(

      collection(
        db,
        "chats",
        chatId,
        "messages"
      ),

      orderBy("time")

    );


  onSnapshot(

    messagesQuery,

    async (snapshot) => {

      console.log(
        "MESSAGES RECEIVED:",
        snapshot.size
      );


      messagesBox.innerHTML =
        "";


      snapshot.forEach(
        (messageDoc) => {

          const data =
            messageDoc.data();


          // ===============================
          // MARK INCOMING MESSAGE AS SEEN
          // ===============================

          if (
            data.uid !==
              currentUser.uid &&
            data.seen === false
          ) {

            updateDoc(

              doc(
                db,
                "chats",
                chatId,
                "messages",
                messageDoc.id
              ),

              {
                seen: true
              }

            ).catch(
              (error) => {

                console.error(
                  "SEEN UPDATE ERROR:",
                  error
                );

              }
            );

          }


          // ===============================
          // CREATE MESSAGE
          // ===============================

          const message =
            document.createElement(
              "div"
            );


          message.className =
            data.uid ===
            currentUser.uid

              ? "message my-message"

              : "message other-message";


          const timeText =
            data.time
              ? data.time
                  .toDate()
                  .toLocaleTimeString(
                    [],
                    {
                      hour: "2-digit",
                      minute: "2-digit"
                    }
                  )

              : "Sending...";


          const seenText =
            data.uid ===
            currentUser.uid

              ? (
                  data.seen
                    ? " ✓✓"
                    : " ✓"
                )

              : "";


          message.innerHTML = `

            <div class="message-profile">

              <img
                class="message-avatar"
                src="images/avatars/${
                  data.avatar ||
                  "avatar1.png"
                }"
              >

              <div>

                <div class="message-name">
                  ${
                    data.name ||
                    "User"
                  }
                </div>

                <div class="message-text">
                  ${
                    data.text ||
                    ""
                  }
                </div>

                <div class="message-time">

                  ${timeText}

                  ${seenText}

                </div>

              </div>

            </div>

          `;


          messagesBox.appendChild(
            message
          );

        }
      );


      messagesBox.scrollTop =
        messagesBox.scrollHeight;

    },

    (error) => {

      console.error(
        "MESSAGE LISTENER ERROR:",
        error
      );

    }

  );

}


// ===============================
// LISTEN FOR TYPING
// ===============================

function listenTyping() {

  console.log(
    "LISTENING FOR TYPING"
  );


  const chatRef =
    doc(
      db,
      "chats",
      chatId
    );


  onSnapshot(

    chatRef,

    (snapshot) => {

      if (!snapshot.exists()) {

        return;

      }


      const chatData =
        snapshot.data();


      if (

        chatData.typing &&

        chatData.typing.uid ===
          otherUserId &&

        chatData.typing.status ===
          true

      ) {

        typingStatus.textContent =
          "Typing...";

      }

      else {

        typingStatus.textContent =
          "";

      }

    },

    (error) => {

      console.error(
        "TYPING LISTENER ERROR:",
        error
      );

    }

  );

}


// ===============================
// TYPING DETECTION
// ===============================

messageInput.addEventListener(
  "input",
  async () => {

    if (!currentUser) {

      return;

    }


    clearTimeout(
      typingTimer
    );


    try {

      await updateDoc(

        doc(
          db,
          "chats",
          chatId
        ),

        {

          typing: {

            uid:
              currentUser.uid,

            status:
              true

          }

        }

      );

    }

    catch (error) {

      console.error(
        "TYPING ERROR:",
        error
      );

    }


    typingTimer =
      setTimeout(
        async () => {

          try {

            await updateDoc(

              doc(
                db,
                "chats",
                chatId
              ),

              {

                typing: {

                  uid:
                    currentUser.uid,

                  status:
                    false

                }

              }

            );

          }

          catch (error) {

            console.error(
              "STOP TYPING ERROR:",
              error
            );

          }

        },

        1000

      );

  }

);


// ===============================
// SEND BUTTON
// ===============================

sendBtn.addEventListener(
  "click",
  sendMessage
);


// ===============================
// ENTER KEY
// ===============================

messageInput.addEventListener(
  "keydown",
  (event) => {

    if (

      event.key === "Enter" &&

      !event.shiftKey

    ) {

      event.preventDefault();

      sendMessage();

    }

  }

);


// ===============================
// SEND MESSAGE
// ===============================

async function sendMessage() {

  console.log(
    "SEND MESSAGE CALLED"
  );


  // ===============================
  // DUPLICATE PROTECTION
  // ===============================

  if (isSending) {

    console.log(
      "Duplicate send blocked"
    );

    return;

  }


  const text =
    messageInput.value.trim();


  if (text === "") {

    return;

  }


  if (!currentUser) {

    console.error(
      "NO CURRENT USER"
    );

    return;

  }


  // Lock immediately

  isSending =
    true;

  sendBtn.disabled =
    true;


  try {

    // ===============================
    // GET USER PROFILE
    // ===============================

    const userRef =
      doc(
        db,
        "users",
        currentUser.uid
      );


    const userSnap =
      await getDoc(
        userRef
      );


    if (!userSnap.exists()) {

      console.error(
        "USER PROFILE NOT FOUND"
      );

      return;

    }


    const userData =
      userSnap.data();


    // ===============================
    // SAVE MESSAGE
    // ===============================

    await addDoc(

      collection(
        db,
        "chats",
        chatId,
        "messages"
      ),

      {

        text:
          text,

        uid:
          currentUser.uid,

        name:
          userData.username ||
          userData.name ||
          "User",

        avatar:
          userData.avatar ||
          "avatar1.png",

        time:
          serverTimestamp(),

        seen:
          false

      }

    );


    // ===============================
    // UPDATE CHAT PREVIEW
    // ===============================

await updateDoc(
  doc(
    db,
    "chats",
    chatId
  ),
  {
    lastMessage: text,

    lastMessageTime:
      serverTimestamp(),

    [`unread.${otherUserId}`]:
      increment(1)
  }
  );

    // ===============================
    // CLEAR INPUT
    // ===============================

    messageInput.value =
      "";

  }

  catch (error) {

    console.error(
      "SEND MESSAGE ERROR:",
      error
    );

  }

  finally {

    isSending =
      false;

    sendBtn.disabled =
      false;

  }

}