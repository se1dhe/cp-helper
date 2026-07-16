import { collection, doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

// Онлайн-статус мемберов: клиент раз в 45 сек обновляет lastSeen (heartbeat).
// Онлайн = lastSeen не старше 2 минут и online != false.
const COLLECTION = 'presence';
const HEARTBEAT_MS = 45000;
const ONLINE_WINDOW_MS = 120000;

let heartbeatTimer = null;

export const startPresence = (userId, nickname) => {
  if (!userId) return;
  const ref = doc(db, COLLECTION, userId);
  const beat = () =>
    setDoc(
      ref,
      { nickname: nickname || '', online: true, lastSeen: serverTimestamp() },
      { merge: true }
    ).catch(() => {});
  beat();
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  heartbeatTimer = setInterval(beat, HEARTBEAT_MS);
};

export const stopPresence = async (userId) => {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
  if (!userId) return;
  try {
    await setDoc(
      doc(db, COLLECTION, userId),
      { online: false, lastSeen: serverTimestamp() },
      { merge: true }
    );
  } catch {
    /* offline / нет прав — не критично */
  }
};

export const subscribeToPresence = (callback) => {
  return onSnapshot(collection(db, COLLECTION), (snapshot) => {
    const map = {};
    snapshot.forEach((d) => {
      map[d.id] = d.data();
    });
    callback(map);
  });
};

export const isUserOnline = (presence) => {
  if (!presence || presence.online === false) return false;
  const last = presence.lastSeen?.toDate?.();
  if (!last) return false;
  return Date.now() - last.getTime() < ONLINE_WINDOW_MS;
};
