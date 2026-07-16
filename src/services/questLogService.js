import { doc, onSnapshot, setDoc } from 'firebase/firestore';
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

export const toggleQuestCompletion = async (userId, questName, done) => {
  const ref = doc(db, DOC_PATH);
  await setDoc(ref, { [userId]: { [questName]: done } }, { merge: true });
};
