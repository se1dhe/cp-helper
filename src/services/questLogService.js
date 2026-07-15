import { doc, onSnapshot, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const DOC_PATH = 'config/questLog';

export const subscribeToQuestLog = (callback) => {
  return onSnapshot(doc(db, DOC_PATH), (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data());
    } else {
      callback({});
    }
  });
};

export const toggleQuestCompletion = async (slotId, questName, done) => {
  const ref = doc(db, DOC_PATH);
  const update = { [`${slotId}.${questName}`]: done };
  try {
    await updateDoc(ref, update);
  } catch {
    await setDoc(ref, update, { merge: true });
  }
};
