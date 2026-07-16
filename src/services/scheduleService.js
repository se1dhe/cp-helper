import { collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Недельное расписание прайм-тайма.
// events: schedule/{id} — { day 0..6 (Пн..Вс), time 'HH:MM', title, type, note }
// посещаемость: scheduleAttendance/{userId} — { nickname, events: { [eventId]: bool } }
// (каждый мембер пишет только свой документ — см. firestore.rules).
const EVENTS = 'schedule';
const ATT = 'scheduleAttendance';

export const subscribeToSchedule = (callback) => {
  const q = query(collection(db, EVENTS), orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
};

export const addEvent = (day, time, title, type, note) =>
  addDoc(collection(db, EVENTS), {
    day: Number(day) || 0,
    time: time || '',
    title,
    type: type || 'other',
    note: note || '',
    createdAt: serverTimestamp(),
  });

export const updateEvent = (id, data) => updateDoc(doc(db, EVENTS, id), data);

export const deleteEvent = (id) => deleteDoc(doc(db, EVENTS, id));

export const subscribeToAttendance = (callback) => {
  return onSnapshot(collection(db, ATT), (snap) => {
    const map = {};
    snap.forEach((d) => { map[d.id] = d.data(); });
    callback(map);
  });
};

export const setAttendance = (userId, nickname, eventId, going) => {
  if (!userId) return Promise.resolve();
  return setDoc(
    doc(db, ATT, userId),
    { nickname: nickname || '', events: { [eventId]: going } },
    { merge: true }
  );
};
