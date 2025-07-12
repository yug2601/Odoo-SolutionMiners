import { useEffect, useState } from 'react';
import { db } from '../utils/firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import Navbar from '../components/Navbar';

export default function AdminPage() {
  const [swaps, setSwaps] = useState<any[]>([]);

  useEffect(() => {
    const fetchSwaps = async () => {
      const snapshot = await getDocs(collection(db, 'swaps'));
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setSwaps(data);
    };
    fetchSwaps();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await updateDoc(doc(db, 'swaps', id), { status });
    alert('Status updated');
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <Navbar />
      <main className="max-w-3xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Admin Panel - Review Swaps</h1>
        {swaps.map((swap) => (
          <div key={swap.id} className="bg-white dark:bg-gray-800 p-4 rounded shadow mb-4">
            <p><strong>From:</strong> {swap.from}</p>
            <p><strong>To:</strong> {swap.to}</p>
            <p><strong>Status:</strong> {swap.status}</p>
            <div className="space-x-2 mt-2">
              <button
                onClick={() => updateStatus(swap.id, 'approved')}
                className="px-3 py-1 bg-green-600 text-white rounded"
              >Approve</button>
              <button
                onClick={() => updateStatus(swap.id, 'rejected')}
                className="px-3 py-1 bg-red-600 text-white rounded"
              >Reject</button>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}