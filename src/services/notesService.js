import { collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';

// Заметки офицеров/ПЛ, отображаемые всем на дашборде.
const COLLECTION = 'notes';

export const subscribeToNotes = (callback) => {
  const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};

export const addNote = (text, author, authorId) =>
  addDoc(collection(db, COLLECTION), {
    text,
    author: author || '',
    authorId: authorId || '',
    createdAt: serverTimestamp(),
  });

export const updateNote = (id, text) => updateDoc(doc(db, COLLECTION, id), { text });

export const deleteNote = (id) => deleteDoc(doc(db, COLLECTION, id));

export const seedNotes = async (texts, author, authorId) => {
  const batch = writeBatch(db);
  texts.forEach((text) => {
    const ref = doc(collection(db, COLLECTION));
    batch.set(ref, { text, author: author || '', authorId: authorId || '', createdAt: serverTimestamp() });
  });
  await batch.commit();
};
