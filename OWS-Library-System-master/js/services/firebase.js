import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA2DtLSBqkedpSROfN6cj6Y1vOcTUjV8zQ",
  authDomain: "ows-library-system.firebaseapp.com",
  projectId: "ows-library-system",
  storageBucket: "ows-library-system.firebasestorage.app",
  messagingSenderId: "1013680747590",
  appId: "1:1013680747590:web:6f3607a94ff2b111940647",
  measurementId: "G-LC8JHGL4ZT"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);