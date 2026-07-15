import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const DOC_PATH = 'config/minContributions';

export const subscribeToMinContributions = (callback) => {
  return onSnapshot(doc(db, DOC_PATH), (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data().amount || 0);
    } else {
      callback(0);
    }
  });
};

export const setMinContribution = async (amount) => {
  const ref = doc(db, DOC_PATH);
  await setDoc(ref, { amount: Number(amount) }, { merge: true });
};
