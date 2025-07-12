import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import Navbar from '../../components/Navbar';

interface Profile {
  name: string;
  skillsOffered: string[];
  skillsWanted: string[];
}

export default function PublicProfile() {
  const router = useRouter();
  const { id } = router.query;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id || typeof id !== 'string') {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        const ref = doc(db, 'users', id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setProfile(snap.data() as Profile);
        } else {
          setError('Profile not found');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile. Please check your Firebase configuration.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <Navbar />
      <main className="max-w-2xl mx-auto p-4">
        {error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 animate-fade-in">
            {error}
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="spinner w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : profile ? (
          <div className="card p-8 animate-fade-in">
            <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{profile.name || 'Anonymous User'}&apos;s Profile</h1>
            <div className="space-y-2">
              <p><span className="font-semibold text-gray-700 dark:text-gray-200">Skills Offered:</span> {profile.skillsOffered?.length ? profile.skillsOffered.map((s, i) => <span key={i} className="badge badge-info ml-2">{s}</span>) : <span className="text-gray-400 ml-2">No skills listed</span>}</p>
              <p><span className="font-semibold text-gray-700 dark:text-gray-200">Skills Wanted:</span> {profile.skillsWanted?.length ? profile.skillsWanted.map((s, i) => <span key={i} className="badge badge-warning ml-2">{s}</span>) : <span className="text-gray-400 ml-2">No skills wanted</span>}</p>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500">Profile not found.</p>
        )}
      </main>
    </div>
  );
}
