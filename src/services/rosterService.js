import { collection, doc, getDocs, updateDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

const COLLECTION = 'roster';

// Default initial roster if empty
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
