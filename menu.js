import { auth, db } from "./firebase.js";

import {
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const menuButton = document.getElementById("menu");
const menuBox = document.getElementById("menuBox");

const logoutBtn =
  document.getElementById("logoutBtn");

const editProfileBtn =
  document.getElementById("editProfileMenuBtn");

const editProfileBox =
  document.getElementById("editProfileBox");

const newUsername =
  document.getElementById("newUsername");

const newBio =
  document.getElementById("newBio");

const saveProfileBtn =
  document.getElementById("saveProfileBtn");


// ===============================
// MENU
// ===============================

if (menuButton && menuBox) {

  menuButton.addEventListener("click", () => {

    menuBox.classList.toggle("show");

  });

}


// ===============================
// AUTH
// ===============================

let currentUser = null;

onAuthStateChanged(auth, async (user) => {

  if (!user) {

    window.location.href =
      "login.html";

    return;

  }

  currentUser = user;

  await loadProfileSettings();

});


// ===============================
// LOAD PROFILE SETTINGS
// ===============================

async function loadProfileSettings() {

  try {

    const userRef =
      doc(
        db,
        "users",
        currentUser.uid
      );

    const snapshot =
      await getDoc(userRef);

    if (!snapshot.exists()) return;

    const data =
      snapshot.data();

    if (newUsername) {

      newUsername.value =
        data.username ||
        data.name ||
        "";

    }

    if (newBio) {

      newBio.value =
        data.bio ||
        "";

    }

  }

  catch (error) {

    console.error(
      "PROFILE SETTINGS ERROR:",
      error
    );

  }

}


// ===============================
// EDIT PROFILE
// ===============================

if (editProfileBtn) {

  editProfileBtn.addEventListener(
    "click",
    async () => {

      if (!editProfileBox) return;

      editProfileBox.style.display =
        editProfileBox.style.display ===
        "none"

          ? "block"

          : "none";

      if (
        editProfileBox.style.display ===
        "block"
      ) {

        await loadProfileSettings();

      }

    }
  );

}


// ===============================
// SAVE PROFILE
// ===============================

if (saveProfileBtn) {

  saveProfileBtn.addEventListener(
    "click",
    async () => {

      if (!currentUser) return;

      const username =
        newUsername.value.trim();

      const bio =
        newBio.value.trim();

      if (!username) {

        alert(
          "Please enter a username."
        );

        return;

      }

      saveProfileBtn.disabled =
        true;

      try {

        await updateDoc(

          doc(
            db,
            "users",
            currentUser.uid
          ),

          {

            username:
              username,

            bio:
              bio

          }

        );

        alert(
          "Profile updated successfully."
        );

        editProfileBox.style.display =
          "none";

      }

      catch (error) {

        console.error(
          "SAVE PROFILE ERROR:",
          error
        );

        alert(
          "Could not update profile."
        );

      }

      finally {

        saveProfileBtn.disabled =
          false;

      }

    }
  );

}


// ===============================
// LOGOUT
// ===============================

if (logoutBtn) {

  logoutBtn.addEventListener(
    "click",
    async () => {

      try {

        await signOut(auth);

        window.location.href =
          "login.html";

      }

      catch (error) {

        console.error(
          "LOGOUT ERROR:",
          error
        );

      }

    }
  );

}
