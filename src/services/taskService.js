import { collection, doc, updateDoc, onSnapshot, query, orderBy, addDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const COLLECTION = 'tasks';

export const subscribeToTasks = (callback) => {
  const q = query(collection(db, COLLECTION), orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(data);
  });
};

// assignedTo: '' — общая задача для всей пати; иначе userId конкретного игрока.
export const addTask = async (text, tag, assignedTo = '', assignedToName = '') => {
  await addDoc(collection(db, COLLECTION), {
    text,
    tag, // 'prime' or 'offprime'
    done: false,
    assignedTo: assignedTo || '',
    assignedToName: assignedToName || '',
    createdAt: serverTimestamp()
  });
};

export const toggleTask = async (taskId, currentStatus) => {
  const taskRef = doc(db, COLLECTION, taskId);
  await updateDoc(taskRef, { done: !currentStatus });
};

export const deleteTask = async (taskId) => {
  const taskRef = doc(db, COLLECTION, taskId);
  await deleteDoc(taskRef);
};
