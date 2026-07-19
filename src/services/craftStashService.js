import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Личные закладки/накопление ресурсов крафта: craftStash/{uid} = { items: [...] }.
// Только владелец читает и пишет (per-user, синхронизируется между устройствами).
const COLLECTION = 'craftStash';

export const subscribeToCraftStash = (uid, callback) =>
  onSnapshot(doc(db, COLLECTION, uid), (s) => callback(s.exists() ? (s.data().items || []) : []));

export const setCraftStash = (uid, items) =>
  setDoc(doc(db, COLLECTION, uid), { items }, { merge: true });

// Добавить предмет в закладки (из раздела «Рецепты»). Возвращает false, если уже есть.
export const addCraftStashItem = async (uid, item) => {
  const ref = doc(db, COLLECTION, uid);
  const snap = await getDoc(ref);
  const items = snap.exists() ? (snap.data().items || []) : [];
  if (items.some((x) => String(x.productId) === String(item.productId))) return false;
  await setDoc(ref, { items: [...items, item] }, { merge: true });
  return true;
};
