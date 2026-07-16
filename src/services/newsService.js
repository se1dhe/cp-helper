import { collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

// Новости КП: публикуют ПЛ/офицеры, читают все мемберы.
const COLLECTION = 'news';

export const subscribeToNews = (callback) => {
  const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};

export const addNews = (title, body, author, authorId) =>
  addDoc(collection(db, COLLECTION), {
    title,
    body,
    author: author || '',
    authorId: authorId || '',
    createdAt: serverTimestamp(),
  });

export const updateNews = (id, data) => updateDoc(doc(db, COLLECTION, id), data);

export const deleteNews = (id) => deleteDoc(doc(db, COLLECTION, id));
