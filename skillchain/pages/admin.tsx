import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../utils/firebase';
import { collection, getDocs, updateDoc, doc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
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
}

interface User {
  id: string;
  name: string;
  email: string;
  completedSwaps: number;
  skillsOffered: string[];
  skillsWanted: string[];
  createdAt: any;
}

export default function AdminPage() {
  const { user } = useAuth();
  const [swaps, setSwaps] = useState<Swap[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'swaps' | 'users' | 'moderation'>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch swaps
        const swapsSnapshot = await getDocs(collection(db, 'swaps'));
        const swapsData = swapsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Swap[];
        
        // Fetch users
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersData = usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as User[];
        
        setSwaps(swapsData.sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate()));
        setUsers(usersData.sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate()));
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please check your Firebase configuration.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const updateSwapStatus = async (id: string, status: string) => {
    try {
      setUpdating(id);
      setError(null);
      await updateDoc(doc(db, 'swaps', id), { status });
      
      // Update local state
      setSwaps(prev => prev.map(swap => 
        swap.id === id ? { ...swap, status: status as any } : swap
      ));
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update status. Please try again.');
    } finally {
      setUpdating(null);
    }
  };

  const deleteSwap = async (id: string) => {
    if (!confirm('Are you sure you want to delete this swap?')) return;
    
    try {
      setUpdating(id);
      setError(null);
      await deleteDoc(doc(db, 'swaps', id));
      
      // Update local state
      setSwaps(prev => prev.filter(swap => swap.id !== id));
    } catch (err) {
      console.error('Error deleting swap:', err);
      setError('Failed to delete swap. Please try again.');
    } finally {
      setUpdating(null);
    }
  };

  const getStats = () => {
    const totalUsers = users.length;
    const totalSwaps = swaps.length;
    const pendingSwaps = swaps.filter(s => s.status === 'pending').length;
    const completedSwaps = swaps.filter(s => s.status === 'completed').length;
    const totalSkills = users.reduce((sum, user) => sum + user.skillsOffered.length, 0);
    
    return { totalUsers, totalSwaps, pendingSwaps, completedSwaps, totalSkills };
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Check if user is admin
  if (!user || user.email !== 'admin@skillchain.com') {
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
              Access Denied
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Admin privileges required to access this page.
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  const stats = getStats();

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
              Admin Dashboard
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Manage your SkillChain platform and community
            </p>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-8"
          >
            <div className="flex bg-white dark:bg-gray-800 rounded-lg p-1 shadow-lg">
              {[
                { id: 'overview', label: 'Overview', icon: '📊' },
                { id: 'swaps', label: 'Swaps', icon: '🔄' },
                { id: 'users', label: 'Users', icon: '👥' },
                { id: 'moderation', label: 'Moderation', icon: '🛡️' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-6 py-3 rounded-md font-medium transition-all flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full"
              />
            </div>
          )}

          {/* Content */}
          <AnimatePresence mode="wait">
            {!loading && (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'overview' && (
                  <div className="space-y-8">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="card card-glass text-center">
                        <div className="text-3xl font-bold gradient-text mb-2">
                          {stats.totalUsers}
                        </div>
                        <div className="text-gray-600 dark:text-gray-300">
                          Total Users
                        </div>
                      </div>
                      <div className="card card-glass text-center">
                        <div className="text-3xl font-bold gradient-text mb-2">
                          {stats.totalSwaps}
                        </div>
                        <div className="text-gray-600 dark:text-gray-300">
                          Total Swaps
                        </div>
                      </div>
                      <div className="card card-glass text-center">
                        <div className="text-3xl font-bold gradient-text mb-2">
                          {stats.pendingSwaps}
                        </div>
                        <div className="text-gray-600 dark:text-gray-300">
                          Pending Swaps
                        </div>
                      </div>
                      <div className="card card-glass text-center">
                        <div className="text-3xl font-bold gradient-text mb-2">
                          {stats.totalSkills}
                        </div>
                        <div className="text-gray-600 dark:text-gray-300">
                          Skills Shared
                        </div>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="card card-glass">
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                        Recent Activity
                      </h2>
                      <div className="space-y-4">
                        {swaps.slice(0, 5).map((swap) => (
                          <div key={swap.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-800 dark:text-white">
                                {swap.fromName} → {swap.toName}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {swap.skillOffered} for {swap.skillWanted}
                              </p>
                            </div>
                            <span className={`badge ${swap.status === 'pending' ? 'badge-warning' : swap.status === 'completed' ? 'badge-success' : 'badge'}`}>
                              {swap.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'swaps' && (
                  <div className="space-y-6">
                    {swaps.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12"
                      >
                        <div className="text-6xl mb-4">🔄</div>
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                          No swaps found
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                          No skill swaps have been created yet.
                        </p>
                      </motion.div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {swaps.map((swap, index) => (
                          <motion.div
                            key={swap.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="card card-glass"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h3 className="font-semibold text-lg text-gray-800 dark:text-white">
                                  {swap.fromName} → {swap.toName}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {formatDate(swap.createdAt)}
                                </p>
                              </div>
                              <span className={`badge ${swap.status === 'pending' ? 'badge-warning' : swap.status === 'completed' ? 'badge-success' : 'badge'}`}>
                                {swap.status}
                              </span>
                            </div>

                            <div className="space-y-3 mb-4">
                              <div className="flex items-center space-x-2">
                                <span className="text-green-500">✓</span>
                                <span className="text-sm">Offers: <strong>{swap.skillOffered}</strong></span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-blue-500">🎯</span>
                                <span className="text-sm">Wants: <strong>{swap.skillWanted}</strong></span>
                              </div>
                            </div>

                            {swap.message && (
                              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                  "{swap.message}"
                                </p>
                              </div>
                            )}

                            <div className="flex gap-2">
                              {swap.status === 'pending' && (
                                <>
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => updateSwapStatus(swap.id, 'accepted')}
                                    disabled={updating === swap.id}
                                    className="btn btn-primary text-sm"
                                  >
                                    {updating === swap.id ? 'Updating...' : 'Approve'}
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => updateSwapStatus(swap.id, 'rejected')}
                                    disabled={updating === swap.id}
                                    className="btn btn-secondary text-sm"
                                  >
                                    {updating === swap.id ? 'Updating...' : 'Reject'}
                                  </motion.button>
                                </>
                              )}
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => deleteSwap(swap.id)}
                                disabled={updating === swap.id}
                                className="btn text-sm bg-red-500 hover:bg-red-600 text-white"
                              >
                                {updating === swap.id ? 'Deleting...' : 'Delete'}
                              </motion.button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'users' && (
                  <div className="space-y-6">
                    {users.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12"
                      >
                        <div className="text-6xl mb-4">👥</div>
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                          No users found
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                          No users have registered yet.
                        </p>
                      </motion.div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {users.map((user, index) => (
                          <motion.div
                            key={user.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="card card-glass"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h3 className="font-semibold text-lg text-gray-800 dark:text-white">
                                  {user.name}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {user.email}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Joined: {formatDate(user.createdAt)}
                                </p>
                              </div>
                            </div>

                            <div className="space-y-3 mb-4">
                              <div className="flex items-center space-x-2">
                                <span className="text-green-500">✓</span>
                                <span className="text-sm">{user.completedSwaps} completed swaps</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-blue-500">🎯</span>
                                <span className="text-sm">{user.skillsOffered.length} skills offered</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-purple-500">⭐</span>
                                <span className="text-sm">{user.skillsWanted.length} skills wanted</span>
                              </div>
                            </div>

                            {user.skillsOffered.length > 0 && (
                              <div className="mb-4">
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Skills Offered:
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {user.skillsOffered.slice(0, 5).map((skill, skillIndex) => (
                                    <span key={skillIndex} className="badge badge-success text-xs">
                                      {skill}
                                    </span>
                                  ))}
                                  {user.skillsOffered.length > 5 && (
                                    <span className="badge text-xs">
                                      +{user.skillsOffered.length - 5} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'moderation' && (
                  <div className="space-y-6">
                    <div className="card card-glass">
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                        Moderation Tools
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                          <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                            Pending Swaps
                          </h3>
                          <p className="text-yellow-700 dark:text-yellow-300 mb-4">
                            {stats.pendingSwaps} swaps awaiting approval
                          </p>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setActiveTab('swaps')}
                            className="btn btn-warning"
                          >
                            Review Swaps
                          </motion.button>
                        </div>
                        
                        <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                            User Management
                          </h3>
                          <p className="text-blue-700 dark:text-blue-300 mb-4">
                            Manage {stats.totalUsers} registered users
                          </p>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setActiveTab('users')}
                            className="btn btn-primary"
                          >
                            View Users
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}