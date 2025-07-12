import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { db } from '../utils/firebase';
import { collection, addDoc, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import Navbar from '../components/Navbar';

interface Feedback {
  id: string;
  from: string;
  to: string;
  fromName: string;
  toName: string;
  rating: number;
  category: string;
  text: string;
  createdAt: any;
}

interface User {
  id: string;
  name: string;
  photoURL?: string;
}

export default function FeedbackPage() {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [rating, setRating] = useState(5);
  const [category, setCategory] = useState('general');
  const [users, setUsers] = useState<User[]>([]);
  const [userFeedbacks, setUserFeedbacks] = useState<Feedback[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'give' | 'received'>('give');

  useEffect(() => {
    const fetchUsers = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const snapshot = await getDocs(collection(db, 'users'));
        const mapped = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as User[];
        const usersData = mapped.filter(u => u.id !== user?.uid);
        setUsers(usersData);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users.');
      } finally {
        setLoading(false);
      }
    };

    const fetchUserFeedbacks = async () => {
      if (!user) return;
      
      try {
        const q = query(
          collection(db, 'feedback'),
          where('to', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const feedbacksData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Feedback[];
        setUserFeedbacks(feedbacksData);
      } catch (err) {
        console.error('Error fetching feedbacks:', err);
      }
    };

    fetchUsers();
    fetchUserFeedbacks();
  }, [user]);

  const submitFeedback = async () => {
    if (!user || !selectedUser || !feedback.trim()) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await addDoc(collection(db, 'feedback'), {
        from: user.uid,
        to: selectedUser.id,
        fromName: user.displayName || user.email,
        toName: selectedUser.name,
        rating,
        category,
        text: feedback.trim(),
        createdAt: Timestamp.now(),
      });
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setSelectedUser(null);
      setFeedback('');
      setRating(5);
      setCategory('general');
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getRatingStars = (rating: number) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'communication': return '💬';
      case 'skill-quality': return '🎯';
      case 'punctuality': return '⏰';
      case 'helpfulness': return '🤝';
      case 'overall': return '⭐';
      default: return '📝';
    }
  };

  const getAverageRating = () => {
    if (userFeedbacks.length === 0) return 0;
    const total = userFeedbacks.reduce((sum, fb) => sum + fb.rating, 0);
    return (total / userFeedbacks.length).toFixed(1);
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
              Feedback System
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Please login to access the feedback system.
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
        <main className="pt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
              Feedback System
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Share your experience and help others grow
            </p>
          </motion.div>
          {/* Success Message */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 animate-fade-in"
              >
                Feedback submitted successfully! 🎉
              </motion.div>
            )}
          </AnimatePresence>
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
          {/* Feedback Form - style with card/input */}
          <div className="card p-6 animate-fade-in">
            {/* TODO: Feedback form here */}
          </div>
        </main>
      </div>
    </div>
  );
}