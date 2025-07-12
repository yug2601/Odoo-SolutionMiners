import { useEffect, useState } from 'react';
import { db } from '../utils/firebase';
import { collection, doc, getDocs, query, where } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

export default function SwapsPage() {
  const { user } = useAuth();
  const [swaps, setSwaps] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchSwaps = async () => {
      const ref = collection(db, 'swaps');
      const q = query(ref, where('from', '==', user.uid));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setSwaps(data);
    };

    fetchSwaps();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <Navbar />
      <main className="max-w-3xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Your Swap Requests</h1>
        {swaps.length === 0 ? (
          <p>No swaps sent yet.</p>
        ) : (
          <ul className="space-y-4">
            {swaps.map((swap) => (
              <li key={swap.id} className="bg-white dark:bg-gray-800 p-4 rounded shadow">
                <p><strong>To:</strong> {swap.toName}</p>
                <p><strong>Status:</strong> {swap.status}</p>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
