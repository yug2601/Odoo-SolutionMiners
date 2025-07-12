import { db } from './firebase';
import { addDoc, collection } from 'firebase/firestore';

export const issueSkillToken = async (userId: string, skill: string) => {
  await addDoc(collection(db, 'skillTokens'), {
    userId,
    skill,
    issuedAt: new Date(),
  });
};