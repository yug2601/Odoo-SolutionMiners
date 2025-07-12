import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { db } from '../utils/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import Navbar from '../components/Navbar';
import Link from 'next/link';

interface Profile {
  id: string;
  name: string;
  location?: string;
  photoURL?: string;
  skillsOffered: string[];
  skillsWanted: string[];
  availability?: string;
  bio?: string;
}

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  useEffect(() => {
    const fetchProfiles = async () => {
      if (!user || authLoading) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const snapshot = await getDocs(collection(db, 'users'));
        const mapped = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Profile[];
        const data = mapped.filter(profile => profile.id !== user?.uid); // Exclude current user
        setProfiles(data);
        setFilteredProfiles(data);
      } catch (err) {
        console.error('Error fetching profiles:', err);
        setError('Failed to load profiles. Please check your Firebase configuration.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, [user, authLoading]);

  useEffect(() => {
    let filtered = profiles;
    
    if (searchTerm) {
      filtered = filtered.filter(profile => 
        profile.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.skillsOffered?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
        profile.skillsWanted?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (skillFilter) {
      filtered = filtered.filter(profile => 
        profile.skillsOffered?.some(skill => skill.toLowerCase().includes(skillFilter.toLowerCase())) ||
        profile.skillsWanted?.some(skill => skill.toLowerCase().includes(skillFilter.toLowerCase()))
      );
    }

    if (locationFilter) {
      filtered = filtered.filter(profile => 
        profile.location?.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }
    
    setFilteredProfiles(filtered);
  }, [profiles, searchTerm, skillFilter, locationFilter]);

  const allSkills = Array.from(new Set(
    profiles.flatMap(profile => [
      ...(profile.skillsOffered || []),
      ...(profile.skillsWanted || [])
    ])
  )).sort();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Navbar />
        <div className="pt-20 flex items-center justify-center min-h-screen">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full"
          />
        </div>
      </div>
    );
  }

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
              Welcome to SkillChain
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Please login to discover users and swap skills.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-primary"
            >
              Get Started
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6">
        <main className="pt-32 pb-16">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Discover Amazing Skills
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Connect with talented people, share your expertise, and grow together through skill swapping.
            </p>
          </motion.div>

          {/* Search and Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search skills, people, or locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input text-lg"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={skillFilter}
                  onChange={(e) => setSkillFilter(e.target.value)}
                  className="input"
                >
                  <option value="">All Skills</option>
                  <option value="programming">Programming</option>
                  <option value="design">Design</option>
                  <option value="marketing">Marketing</option>
                  <option value="writing">Writing</option>
                  <option value="music">Music</option>
                  <option value="cooking">Cooking</option>
                  <option value="fitness">Fitness</option>
                  <option value="language">Language</option>
                </select>
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="input"
                >
                  <option value="">All Locations</option>
                  <option value="remote">Remote</option>
                  <option value="local">Local</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Profile Cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence>
              {loading ? (
                <div className="col-span-full flex justify-center items-center py-12">
                  <div className="spinner w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : error ? (
                <div className="col-span-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 animate-fade-in">
                  {error}
                </div>
              ) : filteredProfiles.length === 0 ? (
                <div className="col-span-full text-center text-gray-500 py-12 animate-fade-in">
                  No profiles found.
                </div>
              ) : (
                filteredProfiles.map((profile) => (
                  <motion.div
                    key={profile.id}
                    variants={cardVariants}
                    className="card animate-fade-in flex flex-col gap-4"
                  >
                    <div className="flex items-center gap-4 mb-2">
                      {profile.photoURL ? (
                        <img src={profile.photoURL} alt={profile.name} className="w-12 h-12 rounded-full object-cover border-2 border-indigo-400" />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                          {profile.name?.charAt(0) || 'U'}
                        </div>
                      )}
                      <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">{profile.name}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{profile.location || 'Location not specified'}</p>
                      </div>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700 dark:text-gray-200">Skills Offered:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {profile.skillsOffered?.length ? profile.skillsOffered.map((skill, i) => (
                          <span key={i} className="badge badge-info">{skill}</span>
                        )) : <span className="text-gray-400">None</span>}
                      </div>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700 dark:text-gray-200">Skills Wanted:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {profile.skillsWanted?.length ? profile.skillsWanted.map((skill, i) => (
                          <span key={i} className="badge badge-warning">{skill}</span>
                        )) : <span className="text-gray-400">None</span>}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Link href={`/profile/${profile.id}`} className="btn btn-secondary">View Profile</Link>
                      <Link href={`/swaps?user=${profile.id}`} className="btn btn-primary">Request Swap</Link>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
