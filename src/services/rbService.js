import { collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';

// Таймеры рейд-боссов. nextAt — ms-таймстамп следующего респа (0 = неизвестно).
const COLLECTION = 'raidbosses';

export const subscribeToRB = (callback) => {
  return onSnapshot(collection(db, COLLECTION), (snap) => {
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    list.sort((a, b) => {
      const av = a.nextAt || Infinity, bv = b.nextAt || Infinity;
      if (av !== bv) return av - bv;
      return (a.level || 0) - (b.level || 0);
    });
    callback(list);
  });
};

export const addRB = (name, level, respawnH, note) =>
  addDoc(collection(db, COLLECTION), {
    name, level: Number(level) || 0, respawnH: Number(respawnH) || 0,
    note: note || '', nextAt: 0, createdAt: serverTimestamp(),
  });

export const updateRB = (id, data) => updateDoc(doc(db, COLLECTION, id), data);
export const killNow = (id, respawnH) => updateDoc(doc(db, COLLECTION, id), { nextAt: Date.now() + (Number(respawnH) || 0) * 3600000 });
export const setNextAt = (id, ms) => updateDoc(doc(db, COLLECTION, id), { nextAt: ms || 0 });
export const deleteRB = (id) => deleteDoc(doc(db, COLLECTION, id));

export const seedRB = async (list) => {
  const batch = writeBatch(db);
  list.forEach((b) => {
    const ref = doc(collection(db, COLLECTION));
    batch.set(ref, { name: b.name, level: b.level || 0, respawnH: b.respawnH || 0, note: '', nextAt: 0, createdAt: serverTimestamp() });
  });
  await batch.commit();
};
