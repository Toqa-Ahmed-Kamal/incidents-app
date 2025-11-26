// src/firebase.js
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  serverTimestamp,
  GeoPoint,
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  deleteDoc,
} from "firebase/firestore";
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  fetchSignInMethodsForEmail,
  // << مهم للصفحات
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBLJ1Ea087frqgJSwlo20LEXGDKVHtz8Ww",
  authDomain: "incidents-d46ae.firebaseapp.com",
  projectId: "incidents-d46ae",
  storageBucket: "incidents-d46ae.firebasestorage.app",
  messagingSenderId: "139845102450",
  appId: "1:139845102450:web:9c73b023ac87f5d9798beb",
  measurementId: "G-1ERTNN2GBP",
};

// Init
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Providers
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();
// githubProvider.addScope("read:user");
// githubProvider.addScope("user:email");

// Exports
export {
  // Core
  app,
  db,
  auth,

  // Firestore utils
  serverTimestamp,
  GeoPoint,
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  deleteDoc,

  // Auth utils
  googleProvider,
  githubProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  fetchSignInMethodsForEmail,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
};
