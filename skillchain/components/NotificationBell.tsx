import { useEffect, useState } from 'react';
import { db } from '../utils/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

export default function NotificationBell() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'notifications'), where('to', '==', user.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      setCount(snapshot.size);
    });
    return () => unsub();
  }, [user]);

  return (
    <div className="relative inline-block">
      <span className="material-icons text-white">notifications</span>
      {count > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full px-2 text-xs">
          {count}
        </span>
      )}
    </div>
  );
}