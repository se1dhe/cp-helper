import { collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

// Заявки на крафт: мембер создаёт свою, офицеры/автор правят статус/удаляют.
const COLLECTION = 'craftRequests';

export const subscribeToCraftRequests = (callback) => {
  const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
};

export const addCraftRequest = (productId, productName, count, note, requesterId, requesterName) =>
  addDoc(collection(db, COLLECTION), {
    productId: String(productId), productName, count: Number(count) || 1, note: note || '',
    requesterId, requesterName: requesterName || '', status: 'open', createdAt: serverTimestamp(),
  });

export const setRequestStatus = (id, status) => updateDoc(doc(db, COLLECTION, id), { status });
export const deleteCraftRequest = (id) => deleteDoc(doc(db, COLLECTION, id));
