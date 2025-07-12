// pages/badges/[uid].tsx
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../utils/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import Navbar from '../../components/Navbar';

interface Badge {
  id: string;
  skill: string;
  level: number;
  issuedAt: any;
  description?: string;
  category: string;
}

interface User {
  id: string;
  name: string;
  photoURL?: string;
  location?: string;
  bio?: string;
  completedSwaps: number;
  skillsOffered: string[];
  skillsWanted: string[];
}

export default function BadgeProfile() {
  const router = useRouter();
  const { uid } = router.query;
  const [badges, setBadges] = useState<Badge[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!uid || typeof uid !== 'string') {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch user data
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
          setUser({ id: userDoc.id, ...userDoc.data() } as User);
        }
        
        // Fetch badges
        const q = query(collection(db, 'skillTokens'), where('userId', '==', uid));
        const snapshot = await getDocs(q);
        const badgesData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Badge[];
        setBadges(badgesData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load badges. Please check your Firebase configuration.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [uid]);

  const getBadgeIcon = (category: string) => {
    switch (category) {
      case 'programming': return '💻';
      case 'design': return '🎨';
      case 'language': return '🗣️';
      case 'music': return '🎵';
      case 'sports': return '⚽';
      case 'cooking': return '👨‍🍳';
      case 'art': return '🎭';
      case 'business': return '💼';
      case 'education': return '📚';
      case 'health': return '🏥';
      default: return '🏆';
    }
  };

  const getBadgeColor = (level: number) => {
    switch (level) {
      case 1: return 'from-gray-400 to-gray-600';
      case 2: return 'from-green-400 to-green-600';
      case 3: return 'from-blue-400 to-blue-600';
      case 4: return 'from-purple-400 to-purple-600';
      case 5: return 'from-yellow-400 to-orange-600';
      default: return 'from-indigo-400 to-indigo-600';
    }
  };

  const getLevelTitle = (level: number) => {
    switch (level) {
      case 1: return 'Beginner';
      case 2: return 'Intermediate';
      case 3: return 'Advanced';
      case 4: return 'Expert';
      case 5: return 'Master';
      default: return 'Novice';
    }
  };

  const getAchievementStats = () => {
    const totalBadges = badges.length;
    const totalLevels = badges.reduce((sum, badge) => sum + badge.level, 0);
    const averageLevel = totalBadges > 0 ? (totalLevels / totalBadges).toFixed(1) : 0;
    const maxLevel = Math.max(...badges.map(b => b.level), 0);
    
    return { totalBadges, totalLevels, averageLevel, maxLevel };
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  const stats = getAchievementStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      <main className="pt-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
            Achievement Badges
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Showcasing skills and accomplishments
          </p>
        </motion.div>
        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 animate-fade-in"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="spinner w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {/* Content */}
        <div className="card p-8 animate-fade-in">
          {/* TODO: Map badges here */}
        </div>
      </main>
    </div>
  );
}
