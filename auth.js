console.log("Auth.JS LOADED")
import{auth,db } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import {
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

/* ---------- SIGN UP ---------- */
let selectedAvatar = "avatar1.png";
const signupBtn = document.getElementById("signupBtn");
if (signupBtn) {
  signupBtn.addEventListener("click", async () => {
    
    const name = document.getElementById("name").value.trim();
    
    const usernameField = document.getElementById("username");
    const username = usernameField.value.trim();
    const emailField = document.getElementById("email");
    const email = emailField.value.trim();
    
    
    const passwordField = document.getElementById("password");
    
    const password = passwordField.value;
    
    const confirmPassword = document.getElementById("confirmPassword").value;
    
    if (!email || !password || !confirmPassword) {
      alert("Please fill in all fields.");
      return;
    }
        if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    try {
    
     const userCredential = await createUserWithEmailAndPassword(
     auth,
     email,
     password
   );
    
    
    const user = userCredential.user;    
    await setDoc(doc(db, "users", user.uid),{
      name: name,
      username: username,
      email: user.email,
      online:true,
      avatar: selectedAvatar
    });
     
    
     window.location.href = "home.html";
      
    } catch (error) {
      alert(error.message);
    }
    
  });
  
}

  const avatars = document.querySelectorAll(".avatar");

avatars.forEach((avatar) => {
  
  avatar.addEventListener("click", () => {
    
    avatars.forEach(a => a.classList.remove("selected"));
    
    avatar.classList.add("selected");
    
    selectedAvatar = avatar.dataset.avatar;
    
  });
  
});



/* ---------- LOGIN ---------- */

const loginBtn = document.getElementById("loginBtn");
if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    if (!email || !password) {
      alert("Please enter your email and password.");
      return;
    }
    try {
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      window.location.href = "home.html";
    } catch (error) {
      alert(error.message);
    }
  });
}
