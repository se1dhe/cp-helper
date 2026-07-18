import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Личные закладки/накопление ресурсов крафта: craftStash/{uid} = { items: [...] }.
// Только владелец читает и пишет (per-user, синхронизируется между устройствами).
const COLLECTION = 'craftStash';

export const subscribeToCraftStash = (uid, callback) =>
  onSnapshot(doc(db, COLLECTION, uid), (s) => callback(s.exists() ? (s.data().items || []) : []));

export const setCraftStash = (uid, items) =>
  setDoc(doc(db, COLLECTION, uid), { items }, { merge: true });
