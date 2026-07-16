import { collection, doc, updateDoc, onSnapshot, query, orderBy, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import { seedDefaultRoster } from './rosterService';

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

export const initializeRoster = async () => {
  const existing = await getDocs(collection(db, 'roster'));
  const batch = writeBatch(db);
  for (const slot of existing.docs) {
    batch.delete(doc(db, 'roster', slot.id));
  }
  await batch.commit();
  await seedDefaultRoster();
};
