import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { db } from '../utils/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import Navbar from '../components/Navbar';

interface ProfileData {
  name: string;
  location: string;
  bio: string;
  photoURL: string;
  skillsOffered: string[];
  skillsWanted: string[];
  availability: string;
  privacy: 'public' | 'private';
}

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData>({
    name: '',
    location: '',
    bio: '',
    photoURL: '',
    skillsOffered: [],
    skillsWanted: [],
    availability: '',
    privacy: 'public'
  });
  const [newSkill, setNewSkill] = useState('');
  const [skillType, setSkillType] = useState<'offered' | 'wanted'>('offered');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const ref = doc(db, 'users', user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setProfile({
            name: data.name || '',
            location: data.location || '',
            bio: data.bio || '',
            photoURL: data.photoURL || '',
            skillsOffered: data.skillsOffered || [],
            skillsWanted: data.skillsWanted || [],
            availability: data.availability || '',
            privacy: data.privacy || 'public'
          });
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('Failed to load profile. Please check your Firebase configuration.');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [user]);

  const saveProfile = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      setError(null);
      await setDoc(doc(db, 'users', user.uid), {
        ...profile,
        updatedAt: new Date()
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (!newSkill.trim()) return;
    
    if (skillType === 'offered') {
      setProfile(prev => ({
        ...prev,
        skillsOffered: [...prev.skillsOffered, newSkill.trim()]
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        skillsWanted: [...prev.skillsWanted, newSkill.trim()]
      }));
    }
    setNewSkill('');
  };

  const removeSkill = (skill: string, type: 'offered' | 'wanted') => {
    if (type === 'offered') {
      setProfile(prev => ({
        ...prev,
        skillsOffered: prev.skillsOffered.filter(s => s !== skill)
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        skillsWanted: prev.skillsWanted.filter(s => s !== skill)
      }));
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Navbar />
        <div className="pt-20 flex items-center justify-center min-h-screen">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              Profile Access Required
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Please login to edit your profile.
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6">
        <main className="pt-32 pb-16">
          <div className="flex flex-col md:flex-row gap-10 items-start">
            {/* Column 1: Basic Information */}
            <div className="flex-1 card p-8 mb-8 md:mb-0 animate-fade-in">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                    className="input"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={profile.location}
                    onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                    className="input"
                    placeholder="City, Country"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                    className="input min-h-[100px] resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>
            </div>
            {/* Column 2: Skills */}
            <div className="flex-1 card p-8 animate-fade-in">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Skills</h2>
              <div className="mb-6">
                <span className="font-semibold text-gray-700 dark:text-gray-200">Skills Offered:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile.skillsOffered?.length ? profile.skillsOffered.map((skill, i) => (
                    <span key={i} className="badge badge-info">{skill}</span>
                  )) : <span className="text-gray-400">None</span>}
                </div>
              </div>
              <div>
                <span className="font-semibold text-gray-700 dark:text-gray-200">Skills Wanted:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile.skillsWanted?.length ? profile.skillsWanted.map((skill, i) => (
                    <span key={i} className="badge badge-warning">{skill}</span>
                  )) : <span className="text-gray-400">None</span>}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
