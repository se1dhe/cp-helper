import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export const addTransaction = async (data) => {
  try {
    const docRef = await addDoc(collection(db, 'transactions'), {
      ...data,
      timestamp: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding transaction: ", error);
    throw error;
  }
};

export const subscribeToTransactions = (callback) => {
  const q = query(collection(db, 'transactions'), orderBy('timestamp', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const transactions = [];
    let totalAdena = 0;
    let totalMC = 0;
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      transactions.push({ id: doc.id, ...data });
      
      const amt = Number(data.amount) || 0;
      if (data.currency === 'adena') {
        totalAdena += data.type === 'income' ? amt : -amt;
      } else if (data.currency === 'mc') {
        totalMC += data.type === 'income' ? amt : -amt;
      }
    });
    
    callback({ transactions, totalAdena, totalMC });
  });
};
