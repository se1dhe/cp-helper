import { collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Роадмап развития пака: пункты, сгруппированные по фазам ("День 1", "Неделя 1"...).
// Каждый пункт — отдельный документ (отметка done — обновление одного поля, без гонок).
const COLLECTION = 'roadmap';

export const subscribeToRoadmap = (callback) => {
  const q = query(collection(db, COLLECTION), orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};

export const addRoadmapItem = (phase, phaseOrder, text, order = 0) =>
  addDoc(collection(db, COLLECTION), {
    phase,
    phaseOrder: Number(phaseOrder) || 0,
    text,
    order: Number(order) || 0,
    done: false,
    createdAt: serverTimestamp(),
  });

export const toggleRoadmapItem = (id, currentDone) =>
  updateDoc(doc(db, COLLECTION, id), { done: !currentDone });

export const updateRoadmapItem = (id, data) => updateDoc(doc(db, COLLECTION, id), data);

export const deleteRoadmapItem = (id) => deleteDoc(doc(db, COLLECTION, id));

// Инфо о сервере (дата старта) — config/serverInfo
const SERVER_DOC = 'config/serverInfo';

export const subscribeToServerInfo = (callback) =>
  onSnapshot(doc(db, SERVER_DOC), (snap) => callback(snap.exists() ? snap.data() : {}));

export const setLaunchDate = (launchDate) =>
  setDoc(doc(db, SERVER_DOC), { launchDate }, { merge: true });
