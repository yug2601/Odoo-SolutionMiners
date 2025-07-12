import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../utils/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import Navbar from '../components/Navbar';

export default function Profile() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [skillsOffered, setSkillsOffered] = useState('');
  const [skillsWanted, setSkillsWanted] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      const ref = doc(db, 'users', user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setName(data.name || '');
        setSkillsOffered(data.skillsOffered?.join(', ') || '');
        setSkillsWanted(data.skillsWanted?.join(', ') || '');
      }
    };
    loadProfile();
  }, [user]);

  const saveProfile = async () => {
    if (!user) return;
    await setDoc(doc(db, 'users', user.uid), {
      name,
      skillsOffered: skillsOffered.split(',').map((s) => s.trim()),
      skillsWanted: skillsWanted.split(',').map((s) => s.trim()),
    });
    alert('Profile saved');
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <Navbar />
      <main className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Edit Your Profile</h1>
        <div className="space-y-4">
          <input
            className="w-full p-2 rounded border"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="w-full p-2 rounded border"
            placeholder="Skills You Offer (comma-separated)"
            value={skillsOffered}
            onChange={(e) => setSkillsOffered(e.target.value)}
          />
          <input
            className="w-full p-2 rounded border"
            placeholder="Skills You Want (comma-separated)"
            value={skillsWanted}
            onChange={(e) => setSkillsWanted(e.target.value)}
          />
          <button
            onClick={saveProfile}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save Profile
          </button>
        </div>
      </main>
    </div>
  );
}
