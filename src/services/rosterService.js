import { collection, doc, updateDoc, deleteDoc, setDoc, onSnapshot, query, orderBy, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';

const COLLECTION = 'roster';

export const DEFAULT_ROSTER = [
  { id: 'slot_1', className: 'Sorcerer', type: 'mage', name: '—', lvl: 1, position: 1 },
  { id: 'slot_2', className: 'Sorcerer', type: 'mage', name: '—', lvl: 1, position: 2 },
  { id: 'slot_3', className: 'Sorcerer', type: 'mage', name: '—', lvl: 1, position: 3 },
  { id: 'slot_4', className: 'Terramancer', type: 'mage', name: '—', lvl: 1, position: 4 },
  { id: 'slot_5', className: 'Blade Dancer', type: 'fighter', name: '—', lvl: 1, position: 5 },
  { id: 'slot_6', className: 'Sword Singer', type: 'buffer', name: '—', lvl: 1, position: 6 },
  { id: 'slot_7', className: 'Shillien Elder', type: 'support', name: '—', lvl: 1, position: 7 },
  { id: 'slot_8', className: 'Elven Elder', type: 'support', name: '—', lvl: 1, position: 8 },
  { id: 'slot_9', className: 'Overlord', type: 'buffer', name: '—', lvl: 1, position: 9 },
];

export const seedDefaultRoster = async () => {
  const batch = writeBatch(db);
  for (const slot of DEFAULT_ROSTER) {
    const slotRef = doc(db, COLLECTION, slot.id);
    batch.set(slotRef, slot);
  }
  await batch.commit();
};

export const ensureRosterSeeded = async () => {
  const snapshot = await getDocs(collection(db, COLLECTION));
  if (snapshot.empty) {
    await seedDefaultRoster();
    return true;
  }
  return false;
};

export const subscribeToRoster = (callback) => {
  const q = query(collection(db, COLLECTION), orderBy('position', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(data.length ? data : DEFAULT_ROSTER);
  });
};

export const updateRosterSlot = async (slotId, data) => {
  const slotRef = doc(db, COLLECTION, slotId);
  await updateDoc(slotRef, data);
};

export const addRosterSlot = async () => {
  await ensureRosterSeeded();
  const snapshot = await getDocs(collection(db, COLLECTION));
  const existingSlots = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  const maxPos = existingSlots.reduce((max, s) => Math.max(max, s.position || 0), 0);
  const newPos = maxPos + 1;
  const slotId = `slot_${newPos}`;
  const slotRef = doc(db, COLLECTION, slotId);
  await setDoc(slotRef, {
    id: slotId,
    className: 'Sorcerer',
    type: 'mage',
    name: '—',
    lvl: 1,
    position: newPos,
  });
};

export const deleteRosterSlot = async (slotId) => {
  const slotRef = doc(db, COLLECTION, slotId);
  await deleteDoc(slotRef);
};

export const updateRosterNameByUserId = async (userId, newName) => {
  const q = query(collection(db, COLLECTION));
  const snapshot = await getDocs(q);
  const batch = writeBatch(db);
  snapshot.forEach((doc) => {
    const data = doc.data();
    if (data.userId === userId) {
      batch.update(doc.ref, { name: newName });
    }
  });
  if (snapshot.size > 0) {
    await batch.commit();
  }
};
