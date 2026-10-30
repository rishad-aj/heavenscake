// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-analytics.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  onAuthStateChanged, 
  signOut 
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBvRpWX2xya1Q_gafLoOULQhSETPAXLAjM",
  authDomain: "heavens-cake.firebaseapp.com",
  projectId: "heavens-cake",
  storageBucket: "heavens-cake.firebasestorage.app",
  messagingSenderId: "197873918742",
  appId: "1:197873918742:web:30aca793d2f40d5cb52637",
  measurementId: "G-ZTYF1XS3X3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// DOM Elements
const authModal = document.getElementById("auth-modal");
const openAuthBtn = document.getElementById("open-auth-modal"); // Profile Icon
const navLoginBtn = document.getElementById("nav-login-btn"); // Text Login Button
const closeAuthBtn = document.getElementById("close-auth-modal");
const authForm = document.getElementById("auth-form");
const authTitle = document.getElementById("auth-title");
const authSubmitBtn = document.getElementById("auth-submit-btn");
const googleLoginBtn = document.getElementById("google-login-btn");
const authToggleText = document.getElementById("auth-toggle-text");
const authError = document.getElementById("auth-error");
const authNameInput = document.getElementById("auth-name");

const authFormContainer = document.getElementById("auth-form-container");
const loggedInContainer = document.getElementById("logged-in-container");
const profileAvatarContainer = document.getElementById("profile-avatar-container");
const userNameDisplay = document.getElementById("user-name-display");
const userEmailDisplay = document.getElementById("user-email-display");
const logoutBtn = document.getElementById("logout-btn");

// State
let isLoginMode = true;

function openAuthModal() {
  if (!authModal) return;
  // Close mobile hamburger sidebar if open
  const sidebar = document.getElementById("sidebar");
  const navIcon = document.getElementById("nav-icon");
  sidebar?.classList.remove("active");
  navIcon?.classList.remove("open");

  authModal.style.display = "flex";
  document.body.classList.add("no-scroll", "modal-open");
  document.documentElement.classList.add("no-scroll");
}

function closeAuthModal() {
  if (!authModal) return;
  authModal.style.display = "none";
  authError.textContent = "";

  const reviewModal = document.getElementById("review-modal");
  const isReviewOpen = reviewModal && reviewModal.style.display === "flex";
  if (!isReviewOpen) {
    document.body.classList.remove("no-scroll", "modal-open");
    document.documentElement.classList.remove("no-scroll");
  }
}

window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;

// Modal Toggles
openAuthBtn?.addEventListener("click", openAuthModal);
navLoginBtn?.addEventListener("click", openAuthModal);
closeAuthBtn?.addEventListener("click", closeAuthModal);

window.addEventListener("click", (e) => {
  if (e.target === authModal) {
    closeAuthModal();
  }
});

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && authModal?.style.display === "flex") {
    closeAuthModal();
  }
});

// Switch between Login and Signup modes
authToggleText?.addEventListener("click", () => {
  isLoginMode = !isLoginMode;
  authError.textContent = "";
  
  if (isLoginMode) {
    authTitle.textContent = "Login";
    authSubmitBtn.textContent = "Login";
    authToggleText.textContent = "Don't have an account? Sign Up";
    authNameInput.style.display = "none";
    authNameInput.removeAttribute("required");
  } else {
    authTitle.textContent = "Sign Up";
    authSubmitBtn.textContent = "Sign Up";
    authToggleText.textContent = "Already have an account? Login";
    authNameInput.style.display = "block";
    authNameInput.setAttribute("required", "true");
  }
});

// Email/Password Form Submission (Login/Signup)
authForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = authNameInput.value.trim();
  const email = document.getElementById("auth-email").value.trim();
  const password = document.getElementById("auth-password").value;
  
  authError.textContent = "";
  authSubmitBtn.disabled = true;
  authSubmitBtn.textContent = "Processing...";

  if (isLoginMode) {
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        closeAuthModal();
        authForm.reset();
      })
      .catch((error) => {
        authError.textContent = getFriendlyErrorMessage(error.code);
      })
      .finally(() => {
        authSubmitBtn.disabled = false;
        authSubmitBtn.textContent = "Login";
      });
  } else {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        return updateProfile(userCredential.user, { displayName: name });
      })
      .then(() => {
        userNameDisplay.textContent = name; 
        closeAuthModal();
        authForm.reset();
      })
      .catch((error) => {
        authError.textContent = getFriendlyErrorMessage(error.code);
      })
      .finally(() => {
        authSubmitBtn.disabled = false;
        authSubmitBtn.textContent = "Sign Up";
      });
  }
});

// Google Login
googleLoginBtn?.addEventListener("click", () => {
  authError.textContent = "";
  signInWithPopup(auth, googleProvider)
    .then(() => { closeAuthModal(); })
    .catch((error) => { authError.textContent = getFriendlyErrorMessage(error.code); });
});

// Logout Handling
logoutBtn?.addEventListener("click", () => {
  signOut(auth).catch((error) => { console.error("Sign out error", error); });
});

// Listen for Auth State Changes (Updates Header & Modal UI automatically)
onAuthStateChanged(auth, (user) => {
  if (user) {
    authFormContainer.style.display = "none";
    loggedInContainer.style.display = "block";
    
    // Header visibility flips
    navLoginBtn.style.display = "none"; 
    openAuthBtn.style.display = "block"; 

    userNameDisplay.textContent = user.displayName || "No Name Provided";
    userEmailDisplay.textContent = user.email;

    if (user.photoURL) {
      profileAvatarContainer.innerHTML = `
        <img src="${user.photoURL}" alt="Profile Picture" style="width: 60px; height: 60px; border-radius: 50%; border: 2px solid #fff; object-fit: cover;">
      `;
    } else {
      profileAvatarContainer.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 50px; height: 50px;">
          <path d="M20 21V19C20 17.8954 19.1046 17 18 17H6C4.89543 17 4 17.8954 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
        </svg>
      `;
    }
  } else {
    authFormContainer.style.display = "block";
    loggedInContainer.style.display = "none";
    
    navLoginBtn.style.display = "block"; 
    openAuthBtn.style.display = "none"; 
    profileAvatarContainer.innerHTML = "";
  }
});

// Helper to make Firebase errors user-friendly
function getFriendlyErrorMessage(errorCode) {
  switch (errorCode) {
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return "Incorrect email or password.";
    case 'auth/email-already-in-use':
      return "An account with this email already exists.";
    case 'auth/weak-password':
      return "Password should be at least 6 characters.";
    case 'auth/invalid-email':
      return "Please enter a valid email address.";
    case 'auth/popup-closed-by-user':
      return "Google sign-in was canceled.";
    default:
      return "An error occurred. Please try again.";
  }
}
