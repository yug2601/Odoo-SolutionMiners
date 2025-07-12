import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import Navbar from '../../components/Navbar';

export default function PublicProfile() {
  const router = useRouter();
  const { id } = router.query;
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id || typeof id !== 'string') return;
      const ref = doc(db, 'users', id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setProfile(snap.data());
      }
    };
    fetchProfile();
  }, [id]);

  if (!profile) return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <Navbar />
      <main className="max-w-2xl mx-auto p-4">
        <p className="text-center">Loading profile...</p>
      </main>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <Navbar />
      <main className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">{profile.name}'s Profile</h1>
        <div className="space-y-2">
          <p><strong>Skills Offered:</strong> {profile.skillsOffered?.join(', ')}</p>
          <p><strong>Skills Wanted:</strong> {profile.skillsWanted?.join(', ')}</p>
        </div>
      </main>
    </div>
  );
}
