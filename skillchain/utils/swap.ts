import { db } from './firebase';
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';

export const createSwap = async (fromId: string, toId: string, toName: string) => {
  await addDoc(collection(db, 'swaps'), {
    from: fromId,
    to: toId,
    toName,
    status: 'pending',
    createdAt: new Date(),
  });
};

export const updateSwapStatus = async (swapId: string, status: string) => {
  await updateDoc(doc(db, 'swaps', swapId), {
    status,
  });
};