import { collection, doc, addDoc, deleteDoc, onSnapshot, query, orderBy, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';

// Полезные ссылки: публикуют офицеры+, читают все мемберы.
const COLLECTION = 'links';

export const subscribeToLinks = (callback) => {
  const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
};

export const addLink = (title, url, description, category) =>
  addDoc(collection(db, COLLECTION), {
    title,
    url,
    description: description || '',
    category: category || '',
    createdAt: serverTimestamp(),
  });

export const deleteLink = (id) => deleteDoc(doc(db, COLLECTION, id));

export const seedDefaultLinks = async (defaults) => {
  const batch = writeBatch(db);
  defaults.forEach((l) => {
    const ref = doc(collection(db, COLLECTION));
    batch.set(ref, { ...l, description: l.description || '', createdAt: serverTimestamp() });
  });
  await batch.commit();
};
