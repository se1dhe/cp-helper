import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs, updateDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDU5KhGtNTsFliP5GX2UGo2a-zkGjnAvAw",
  authDomain: "cp-helper-78139.firebaseapp.com",
  projectId: "cp-helper-78139",
  storageBucket: "cp-helper-78139.firebasestorage.app",
  messagingSenderId: "565085621815",
  appId: "1:565085621815:web:3e9aef31200ba99f9379b2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function setPL() {
  const q = query(collection(db, "users"), where("email", "==", "a0w.k1m@gmail.com"));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    console.log("Юзер не найден!");
    process.exit(1);
  }

  const doc = snapshot.docs[0];
  await updateDoc(doc.ref, { role: "PL" });
  console.log("Успех! Роль PL выдана пользователю a0w.k1m@gmail.com");
  process.exit(0);
}

setPL().catch(console.error);
