import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { db } from "./firebase.js";

const auth = getAuth();
const SESSION_KEY = "ows-library-admin-session";

export async function loginAdmin(credentials) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      credentials.username.trim(),
      credentials.password
    );

    const user = userCredential.user;
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({
      username: user.email,
      role: "Admin",
      loggedInAt: new Date().toISOString()
    }));

    return { username: user.email, role: "Admin" };

  } catch (error) {
    // Login failed — show error to user
    alert("Invalid email or password. Access denied.");
    throw error;
  }
}

export async function logoutAdmin() {
  await signOut(auth);
  sessionStorage.removeItem(SESSION_KEY);
  window.location.href = "../index.html";
}
export function getAdminSession() {
  const rawSession = sessionStorage.getItem(SESSION_KEY);
  return rawSession ? JSON.parse(rawSession) : null;
}