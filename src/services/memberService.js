import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const DOC_PATH = 'config/minContributions';

export const subscribeToMinContributions = (callback) => {
  return onSnapshot(doc(db, DOC_PATH), (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data());
    } else {
      callback({});
    }
  });
};

export const setMinContribution = async (slotId, amount) => {
  const ref = doc(db, DOC_PATH);
  await setDoc(ref, { [slotId]: Number(amount) }, { merge: true });
};
