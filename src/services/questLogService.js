import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Прогресс квестов хранится по документу на игрока: questProgress/{userId}
// Формат документа: { quests: { [questName]: boolean } }
// Так каждый мембер может писать ТОЛЬКО свой прогресс (см. firestore.rules),
// и мы не упираемся в лимит одного общего документа.
const COLLECTION = 'questProgress';

// Возвращает единую карту вида { userId: { questName: bool } } —
// совместимо со старым форматом, который ждут Dashboard и MemberProgress.
export const subscribeToQuestLog = (callback) => {
  return onSnapshot(collection(db, COLLECTION), (snapshot) => {
    const map = {};
    snapshot.forEach((d) => {
      map[d.id] = d.data().quests || {};
    });
    callback(map);
  });
};

export const toggleQuestCompletion = async (userId, questName, done) => {
  if (!userId) return;
  const ref = doc(db, COLLECTION, userId);
  await setDoc(ref, { quests: { [questName]: done } }, { merge: true });
};
