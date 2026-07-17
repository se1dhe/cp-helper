import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Общий прайс-лист материалов: config/prices = { itemId: price }. Пишут офицеры, читают все.
const DOC = 'config/prices';

export const subscribeToPrices = (callback) =>
  onSnapshot(doc(db, DOC), (s) => callback(s.exists() ? s.data() : {}));

export const setSharedPrice = (itemId, price) =>
  setDoc(doc(db, DOC), { [itemId]: Number(price) || 0 }, { merge: true });
