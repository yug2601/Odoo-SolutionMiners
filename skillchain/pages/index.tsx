import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../utils/firebase';
import { collection, getDocs } from 'firebase/firestore';
import Navbar from '../components/Navbar';

export default function Home() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<any[]>([]);

  useEffect(() => {
    const fetchProfiles = async () => {
      const snapshot = await getDocs(collection(db, 'users'));
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setProfiles(data);
    };

    fetchProfiles();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <Navbar />
      <main className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Discover Users to Swap Skills With</h1>
        {user ? (
          <ul className="space-y-4">
            {profiles.map((profile) => (
              <li key={profile.id} className="bg-white dark:bg-gray-800 p-4 rounded shadow">
                <p className="font-semibold">{profile.name}</p>
                <p>Offers: {profile.skillsOffered?.join(', ')}</p>
                <p>Wants: {profile.skillsWanted?.join(', ')}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500">Login to see available users.</p>
        )}
      </main>
    </div>
  );
}