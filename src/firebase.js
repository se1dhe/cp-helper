import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, initializeFirestore, persistentLocalCache } from "firebase/firestore";

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

// Персистентный кэш: данные переживают перезапуск, приложение работает и без сети
// (одно окно — single-instance, конфликта вкладок нет). Фолбэк на обычный кэш в памяти,
// если IndexedDB недоступен.
let db;
try {
  db = initializeFirestore(app, { localCache: persistentLocalCache() });
} catch (e) {
  console.warn("Firestore persistent cache недоступен, работаем в памяти:", e);
  db = getFirestore(app);
}

export const signInWithEmail = (email, password) => signInWithEmailAndPassword(auth, email, password);
export const registerWithEmail = async (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};
export const logOut = () => signOut(auth);

export { auth, db };
