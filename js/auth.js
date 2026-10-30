// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-analytics.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  GoogleAuthProvider,
  signInWithPopup,
  reauthenticateWithPopup,
  updateProfile,
  onAuthStateChanged, 
  signOut,
  deleteUser
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
const deleteAccountBtn = document.getElementById("delete-account-btn");
const profileActionsGroup = document.getElementById("profile-actions-group");
const deleteConfirmContainer = document.getElementById("delete-confirm-container");
const confirmDeleteBtn = document.getElementById("confirm-delete-btn");
const cancelDeleteBtn = document.getElementById("cancel-delete-btn");
const deleteAccountError = document.getElementById("delete-account-error");

// State
let isLoginMode = true;

function resetDeleteConfirmUI() {
  if (deleteAccountError) deleteAccountError.textContent = "";
  if (deleteConfirmContainer) deleteConfirmContainer.style.display = "none";
  if (profileActionsGroup) profileActionsGroup.style.display = "flex";
  if (confirmDeleteBtn) {
    confirmDeleteBtn.disabled = false;
    confirmDeleteBtn.textContent = "Yes, Delete";
  }
}

function openAuthModal() {
  if (!authModal) return;
  // Close mobile hamburger sidebar if open
  const sidebar = document.getElementById("sidebar");
  const navIcon = document.getElementById("nav-icon");
  sidebar?.classList.remove("active");
  navIcon?.classList.remove("open");

  resetDeleteConfirmUI();
  authModal.style.display = "flex";
  document.body.classList.add("no-scroll", "modal-open");
  document.documentElement.classList.add("no-scroll");
}

function closeAuthModal() {
  if (!authModal) return;
  authModal.style.display = "none";
  authError.textContent = "";
  resetDeleteConfirmUI();

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
  signOut(auth)
    .then(() => { closeAuthModal(); })
    .catch((error) => { console.error("Sign out error", error); });
});

// Delete Account Flow
deleteAccountBtn?.addEventListener("click", () => {
  if (deleteAccountError) deleteAccountError.textContent = "";
  if (profileActionsGroup) profileActionsGroup.style.display = "none";
  if (deleteConfirmContainer) deleteConfirmContainer.style.display = "block";
});

cancelDeleteBtn?.addEventListener("click", () => {
  resetDeleteConfirmUI();
});

confirmDeleteBtn?.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return;

  if (deleteAccountError) deleteAccountError.textContent = "";
  confirmDeleteBtn.disabled = true;
  confirmDeleteBtn.textContent = "Deleting...";

  try {
    await deleteUser(user);
    closeAuthModal();
  } catch (error) {
    if (error.code === "auth/requires-recent-login") {
      const isGoogleUser = user.providerData?.some((p) => p.providerId === "google.com");
      if (isGoogleUser) {
        try {
          await reauthenticateWithPopup(user, googleProvider);
          await deleteUser(auth.currentUser);
          closeAuthModal();
          return;
        } catch (reauthError) {
          if (deleteAccountError) {
            deleteAccountError.textContent = getFriendlyErrorMessage(reauthError.code);
          }
        }
      } else if (deleteAccountError) {
        deleteAccountError.textContent = "For security, please log out and log back in before deleting your account.";
      }
    } else if (deleteAccountError) {
      deleteAccountError.textContent = getFriendlyErrorMessage(error.code);
    }
    confirmDeleteBtn.disabled = false;
    confirmDeleteBtn.textContent = "Yes, Delete";
  }
});

// Listen for Auth State Changes (Updates Header & Modal UI automatically)
onAuthStateChanged(auth, (user) => {
  resetDeleteConfirmUI();
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
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 56px; height: 56px;">
          <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
          <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
          <g id="SVGRepo_iconCarrier">
            <path d="M12.12 12.78C12.05 12.77 11.96 12.77 11.88 12.78C10.12 12.72 8.71997 11.28 8.71997 9.50998C8.71997 7.69998 10.18 6.22998 12 6.22998C13.81 6.22998 15.28 7.69998 15.28 9.50998C15.27 11.28 13.88 12.72 12.12 12.78Z" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M18.74 19.3801C16.96 21.0101 14.6 22.0001 12 22.0001C9.40001 22.0001 7.04001 21.0101 5.26001 19.3801C5.36001 18.4401 5.96001 17.5201 7.03001 16.8001C9.77001 14.9801 14.25 14.9801 16.97 16.8001C18.04 17.5201 18.64 18.4401 18.74 19.3801Z" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
          </g>
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
      return "Sign-in popup was canceled.";
    case 'auth/requires-recent-login':
      return "For security, please log out and log back in before deleting your account.";
    default:
      return "An error occurred. Please try again.";
  }
}
