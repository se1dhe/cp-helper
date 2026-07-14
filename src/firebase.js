import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with your actual Firebase project config
// 1. Go to Firebase Console (https://console.firebase.google.com/)
// 2. Create a new project
// 3. Add a Web App to the project
// 4. Copy the config object below
const firebaseConfig = {
  apiKey: "AIzaSyDU5KhGtNTsFliP5GX2UGo2a-zkGjnAvAw",
  authDomain: "cp-helper-78139.firebaseapp.com",
  projectId: "cp-helper-78139",
  storageBucket: "cp-helper-78139.firebasestorage.app",
  messagingSenderId: "565085621815",
  appId: "1:565085621815:web:3e9aef31200ba99f9379b2",
  measurementId: "G-XSP6NG6TNW"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logOut = () => signOut(auth);

export { auth, db };
