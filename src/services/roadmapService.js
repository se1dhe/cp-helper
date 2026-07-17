import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Общий прогресс встроенного роадмапа: roadmapProgress/{taskId} = { done }
const PROGRESS = 'roadmapProgress';

export const subscribeToRoadmapProgress = (callback) => {
  return onSnapshot(collection(db, PROGRESS), (snap) => {
    const map = {};
    snap.forEach((d) => { map[d.id] = d.data().done === true; });
    callback(map);
  });
};

export const toggleRoadmapProgress = (taskId, done) =>
  setDoc(doc(db, PROGRESS, taskId), { done }, { merge: true });

// Инфо о сервере (дата старта) — config/serverInfo
const SERVER_DOC = 'config/serverInfo';

export const subscribeToServerInfo = (callback) =>
  onSnapshot(doc(db, SERVER_DOC), (snap) => callback(snap.exists() ? snap.data() : {}));

export const setLaunchDate = (launchDate) =>
  setDoc(doc(db, SERVER_DOC), { launchDate }, { merge: true });
