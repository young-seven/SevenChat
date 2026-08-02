import { auth } from "./firebase.js";

import {
  signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const menuButton = document.getElementById("menu");
const menuBox = document.getElementById("menuBox");
const logoutBtn = document.getElementById("logoutBtn");

if (menuButton && menuBox) {

  menuButton.addEventListener("click", () => {

    menuBox.classList.toggle("show");

  });

}

if (logoutBtn) {

  logoutBtn.addEventListener("click", async () => {

    try {

      await signOut(auth);

      window.location.href = "login.html";

    }

    catch (error) {

      console.error(
        "Logout error:",
        error
      );

    }

  });

}
