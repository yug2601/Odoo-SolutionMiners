import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../utils/firebase';
import { collection, getDocs, query, where, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

interface Swap {
  id: string;
  from: string;
  to: string;
  fromName: string;
  toName: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  skillOffered: string;
  skillWanted: string;
  message?: string;
  createdAt: any;
  updatedAt?: any;
}

export default function SwapsPage() {
  const { user } = useAuth();
  const [sentSwaps, setSentSwaps] = useState<Swap[]>([]);
  const [receivedSwaps, setReceivedSwaps] = useState<Swap[]>([]);
  const [activeTab, setActiveTab] = useState<'sent' | 'received'>('sent');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchSwaps = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch sent swaps
        const sentQuery = query(collection(db, 'swaps'), where('from', '==', user.uid));
        const sentSnapshot = await getDocs(sentQuery);
        const sentData = sentSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Swap[];
        
        // Fetch received swaps
        const receivedQuery = query(collection(db, 'swaps'), where('to', '==', user.uid));
        const receivedSnapshot = await getDocs(receivedQuery);
        const receivedData = receivedSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Swap[];
        
        setSentSwaps(sentData.sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate()));
        setReceivedSwaps(receivedData.sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate()));
      } catch (err) {
        console.error('Error fetching swaps:', err);
        setError('Failed to load swaps. Please check your Firebase configuration.');
      } finally {
        setLoading(false);
      }
    };

    fetchSwaps();
  }, [user]);

  const handleSwapAction = async (swapId: string, action: 'accept' | 'reject' | 'complete' | 'delete') => {
    if (!user) return;
    
    try {
      setProcessing(swapId);
      const swapRef = doc(db, 'swaps', swapId);
      
      switch (action) {
        case 'accept':
          await updateDoc(swapRef, { 
            status: 'accepted',
            updatedAt: new Date()
          });
          break;
        case 'reject':
          await updateDoc(swapRef, { 
            status: 'rejected',
            updatedAt: new Date()
          });
          break;
        case 'complete':
          await updateDoc(swapRef, { 
            status: 'completed',
            updatedAt: new Date()
          });
          break;
        case 'delete':
          await deleteDoc(swapRef);
          break;
      }
      
      // Refresh swaps
      const updatedSent = sentSwaps.filter(swap => swap.id !== swapId);
      const updatedReceived = receivedSwaps.filter(swap => swap.id !== swapId);
      setSentSwaps(updatedSent);
      setReceivedSwaps(updatedReceived);
      
    } catch (err) {
      console.error('Error updating swap:', err);
      setError('Failed to update swap. Please try again.');
    } finally {
      setProcessing(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'badge-warning';
      case 'accepted': return 'badge-success';
      case 'rejected': return 'badge';
      case 'completed': return 'badge-primary';
      default: return 'badge';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'accepted': return '✅';
      case 'rejected': return '❌';
      case 'completed': return '🎉';
      default: return '❓';
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
              Swap Management
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Please login to view your skill swaps.
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
              Skill Swaps
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Manage your skill exchange requests and connections
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
          {/* Swap Requests List - style with card/badge */}
          <div className="card p-6 animate-fade-in">
            {/* TODO: Map swap requests here */}
          </div>
        </main>
      </div>
    </div>
  );
}
