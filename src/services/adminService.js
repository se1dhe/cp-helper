import { collection, doc, updateDoc, deleteDoc, onSnapshot, query, orderBy, setDoc, getDocs } from 'firebase/firestore';
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

export const updateUserNickname = async (userId, nickname) => {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, { nickname, displayName: nickname });
};

export const updateUserClass = async (userId, className) => {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, { className });
};

export const clearUserClass = async (userId) => {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, { className: '' });
};

// Сброс ростера до стандартного состояния (вызывается ПЛом)
export const initializeRoster = async () => {
  const existing = await getDocs(collection(db, 'roster'));
  for (const slot of existing.docs) {
    await deleteDoc(doc(db, 'roster', slot.id));
  }
  for (const slot of DEFAULT_ROSTER) {
    const slotRef = doc(db, 'roster', slot.id);
    await setDoc(slotRef, slot);
  }
};
