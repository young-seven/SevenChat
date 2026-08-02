// ===============================
// SevenChat v2
// home.js
// ===============================

// ===============================
// IMPORTS
// ===============================

import { db, auth } from "./firebase.js";
import "./presence.js";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  serverTimestamp,
  onSnapshot,
  orderBy,
  increment
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
  onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

// ===============================
// DOM ELEMENTS
// ===============================

const searchInput = document.getElementById("searchInput");

const chatList = document.getElementById("chatList");


const conversationList =  document.getElementById("conversationList");


// ===============================
// VARIABLES
// ===============================

let users = [];

let currentUser = null;

let chatsLoaded = false;

// ===============================
// AUTH CHECK
// ===============================

onAuthStateChanged(auth, async (user) => {
  
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  currentUser = user;

  loadUsers();
  
  
});
// ===============================
// LOAD USERS (REALTIME)
// ===============================

function loadUsers() {
  onSnapshot(
    collection(db, "users"),
    (snapshot) => {
      users = [];
      snapshot.forEach((userDoc) => {
        users.push({
          id: userDoc.id,
          ...userDoc.data()
        });
      });
      console.log("Users loaded:", users);
      loadConversations();
    },
    (error) => {
      console.log("Users error:", error);
    }
  );
}

// ===============================
// LOAD CONVERSATIONS
// ===============================

function loadConversations() {
  
  const chatsQuery = query(
    collection(db, "chats"),
    orderBy("lastMessageTime", "desc")
  );
  
  onSnapshot(chatsQuery, (snapshot) => {
    
    conversationList.innerHTML = "";
    
    snapshot.forEach((chatDoc) => {
      
      const chat = chatDoc.data();
      
      if (
        !chat.participants ||
        !chat.participants[currentUser.uid]
      ) return;
      
      
      const otherUserId =
        Object.keys(chat.participants)
        .find(uid => uid !== currentUser.uid);
      
      
      const otherUser =
        users.find(user => user.id === otherUserId);
      
      
      if (!otherUser) return;
      
      const card =
        document.createElement("div");
      
      card.className = "userCard";
      
const unreadCount =
  chat.unread?.[currentUser.uid] || 0;

card.innerHTML = `
  <img
    class="userAvatar"
    src="images/avatars/${otherUser.avatar || "avatar1.png"}">

  <div class="userInfo">

    <h3>${otherUser.username || "User"}</h3>

    <p>
      ${chat.lastMessage || "Start chatting..."}
    </p>

  </div>

  ${
    unreadCount > 0
      ? `<div class="unreadBadge">${unreadCount}</div>`
      : ""
  }
`;      
      card.onclick = () => {
        
        window.location.href =
          `chat.html?chatId=${chatDoc.id}`;
        
      };
      
      
      conversationList.appendChild(card);
      
    });
    
  });
  
}
// ===============================
// SEARCH USERS
// ===============================

searchInput.addEventListener("input", () => {

  const text = searchInput.value
    .toLowerCase()
    .trim();

  chatList.innerHTML = "";

  if (text === "") return;

  users.forEach((user) => {

    if (user.id === currentUser.uid) return;

    const username = (user.username || "")
      .toLowerCase();

    if (!username.includes(text)) return;

    const card = document.createElement("div");

    card.className = "userCard";

    card.innerHTML = `
      <img
        class="userAvatar"
        src="images/avatars/${user.avatar || "avatar1.png"}">

      <div class="userInfo">

        <h3>${user.username}</h3>

        <p>${user.online ? "🟢 Online" : "⚪ Offline"}</p>

      </div>

      <button class="startChatBtn">
        Chat
      </button>
    `;

    card
      .querySelector(".startChatBtn")
      .addEventListener("click", () => {

        createChat(user.id);

      });

    chatList.appendChild(card);

  });

});


// ===============================
// CREATE CHAT
// ===============================

async function createChat(otherUserId) {

  const chatKey =
    [currentUser.uid, otherUserId]
    .sort()
    .join("_");
  const existing = await getDocs(

    query(
      collection(db, "chats"),
      where("chatKey", "==", chatKey)
    )
  );

  if (!existing.empty) {
    window.location.href =
      `chat.html?chatId=${existing.docs[0].id}`;
    return;
  }
  const newChat = await addDoc(
    collection(db, "chats"),
    {
      chatKey,
      participants: {
        [currentUser.uid]: true,
        [otherUserId]: true
      },
      lastMessage: "",
      lastMessageTime: serverTimestamp(),
      createdAt: serverTimestamp()
    }
  );

  window.location.href =
    `chat.html?chatId=${newChat.id}`;

}
