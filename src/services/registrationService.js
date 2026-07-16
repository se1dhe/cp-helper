import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const DOC_PATH = 'config/registration';

export const isRegistrationAllowed = async (email) => {
  try {
    const ref = doc(db, DOC_PATH);
    const snap = await getDoc(ref);
    if (!snap.exists()) return true;
    const data = snap.data();
    if (data.open === false && data.allowedEmails?.length) {
      return data.allowedEmails.includes(email);
    }
    return data.open !== false;
  } catch {
    return true;
  }
};
