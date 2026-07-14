import { collection, doc, updateDoc, onSnapshot, query, orderBy, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { DEFAULT_ROSTER } from './rosterService';

export const subscribeToUsers = (callback) => {
  const q = query(collection(db, "users"), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(data);
  });
};

export const updateUserRole = async (userId, newRole) => {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, { role: newRole });
};

// Функция инициализации ростера при первом запуске (вызывается ПЛом)
export const initializeRoster = async () => {
  for (const slot of DEFAULT_ROSTER) {
    const slotRef = doc(db, 'roster', slot.id);
    await setDoc(slotRef, slot);
  }
};
