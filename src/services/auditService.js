import { collection, addDoc, onSnapshot, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

// Иммутабельный аудит-лог ключевых действий.
const COLLECTION = 'audit';

export const logAction = (actorId, actorName, action, detail) =>
  addDoc(collection(db, COLLECTION), {
    actorId: actorId || '', actorName: actorName || '', action, detail: detail || '', ts: serverTimestamp(),
  }).catch(() => {});

export const subscribeToAudit = (callback, max = 120) => {
  const q = query(collection(db, COLLECTION), orderBy('ts', 'desc'), limit(max));
  return onSnapshot(q, (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
};
