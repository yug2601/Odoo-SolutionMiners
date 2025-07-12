// pages/leaderboard.tsx
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../utils/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import Navbar from '../components/Navbar';

interface User {
  id: string;
  name: string;
  points: number;
  completedSwaps: number;
  skillsOffered: string[];
  skillsWanted: string[];
  photoURL?: string;
  location?: string;
}

export default function LeaderboardPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<'all' | 'month' | 'week'>('all');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const snapshot = await getDocs(collection(db, 'users'));
        const data = snapshot.docs.map((doc) => {
          const docData = doc.data();
          return {
            id: doc.id,
            name: docData.name || 'Anonymous User',
            points: typeof docData.points === 'number' ? docData.points : 0,
            completedSwaps: typeof docData.completedSwaps === 'number' ? docData.completedSwaps : 0,
            skillsOffered: docData.skillsOffered || [],
            skillsWanted: docData.skillsWanted || [],
            photoURL: docData.photoURL || '',
            location: docData.location || '',
          };
        });
        
        // Calculate points based on completed swaps and skills
        const usersWithPoints = data.map(user => ({
          ...user,
          points: user.completedSwaps * 10 + user.skillsOffered.length * 5 + user.skillsWanted.length * 2
        }));
        
        const sorted = usersWithPoints.sort((a, b) => b.points - a.points);
        setUsers(sorted);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load leaderboard. Please check your Firebase configuration.');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'from-yellow-400 to-yellow-600';
      case 2: return 'from-gray-300 to-gray-500';
      case 3: return 'from-orange-400 to-orange-600';
      default: return 'from-indigo-500 to-purple-600';
    }
  };

  const getAchievementBadge = (user: User) => {
    if (user.completedSwaps >= 20) return { text: 'Master Swapper', color: 'from-purple-500 to-pink-500' };
    if (user.completedSwaps >= 10) return { text: 'Pro Swapper', color: 'from-blue-500 to-indigo-500' };
    if (user.completedSwaps >= 5) return { text: 'Active Swapper', color: 'from-green-500 to-emerald-500' };
    if (user.completedSwaps >= 1) return { text: 'New Swapper', color: 'from-gray-500 to-gray-600' };
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6">
        <main className="pt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
              Leaderboard
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Top skill swappers and community champions
            </p>
          </motion.div>
          {/* Leaderboard Table */}
          <div className="card p-6 animate-fade-in">
            {/* Add leaderboard table or list here, style with Tailwind */}
            {/* Example row: */}
            {/* <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
              <span className="font-medium text-gray-900 dark:text-white">User Name</span>
              <span className="badge badge-success">123 swaps</span>
            </div> */}
            {/* TODO: Map leaderboard data here */}
          </div>
        </main>
      </div>
    </div>
  );
}
