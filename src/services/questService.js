import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const DOC_PATH = 'config/questData';

export const subscribeToQuestData = (callback) => {
  return onSnapshot(doc(db, DOC_PATH), (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data());
    } else {
      callback(null);
    }
  });
};
