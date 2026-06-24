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
const userNameDisplay = document.getElementById("user-name-display");
const userEmailDisplay = document.getElementById("user-email-display");
const logoutBtn = document.getElementById("logout-btn");

// State
let isLoginMode = true;

// Modal Toggles (Listen to both header elements)
openAuthBtn.addEventListener("click", () => {
  authModal.style.display = "flex";
});

navLoginBtn.addEventListener("click", () => {
  authModal.style.display = "flex";
});

closeAuthBtn.addEventListener("click", () => {
  authModal.style.display = "none";
  authError.textContent = ""; 
});

window.addEventListener("click", (e) => {
  if (e.target === authModal) {
    authModal.style.display = "none";
  }
});

// Switch between Login and Signup modes
authToggleText.addEventListener("click", () => {
  isLoginMode = !isLoginMode;
  authError.textContent = "";
  
  if (isLoginMode) {
    authTitle.textContent = "Login";
    authSubmitBtn.textContent = "Login";
    authToggleText.textContent = "Don't have an account? Sign Up";
    authNameInput.style.display = "none"; // Hide name for login
    authNameInput.removeAttribute("required");
  } else {
    authTitle.textContent = "Sign Up";
    authSubmitBtn.textContent = "Sign Up";
    authToggleText.textContent = "Already have an account? Login";
    authNameInput.style.display = "block"; // Show name for signup
    authNameInput.setAttribute("required", "true");
  }
});

// Email/Password Form Submission (Login/Signup)
authForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = authNameInput.value.trim();
  const email = document.getElementById("auth-email").value.trim();
  const password = document.getElementById("auth-password").value;
  
  authError.textContent = "";
  authSubmitBtn.disabled = true;
  authSubmitBtn.textContent = "Processing...";

  if (isLoginMode) {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        authModal.style.display = "none";
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
        // Update user profile with name provided during sign up
        return updateProfile(userCredential.user, {
          displayName: name
        });
      })
      .then(() => {
        authModal.style.display = "none";
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
googleLoginBtn.addEventListener("click", () => {
  authError.textContent = "";
  signInWithPopup(auth, googleProvider)
    .then((result) => {
      authModal.style.display = "none";
    })
    .catch((error) => {
      authError.textContent = getFriendlyErrorMessage(error.code);
    });
});

// Logout Handling
logoutBtn.addEventListener("click", () => {
  signOut(auth).catch((error) => {
    console.error("Sign out error", error);
  });
});

// Listen for Auth State Changes (Updates Header & Modal UI automatically)
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in
    authFormContainer.style.display = "none";
    loggedInContainer.style.display = "block";
    
    // Header adjustments
    navLoginBtn.style.display = "none"; // Hide text button
    openAuthBtn.style.display = "block"; // Show user icon

    // Set Profile Info
    userNameDisplay.textContent = user.displayName ? user.displayName : "Cake Lover"; // Fallback name
    userEmailDisplay.textContent = user.email;
    
  } else {
    // User is signed out
    authFormContainer.style.display = "block";
    loggedInContainer.style.display = "none";
    
    // Header adjustments
    navLoginBtn.style.display = "block"; // Show text button
    openAuthBtn.style.display = "none"; // Hide user icon
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
