import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../utils/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import Navbar from '../components/Navbar';

export default function FeedbackPage() {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState('');
  const [receiverId, setReceiverId] = useState('');

  const submitFeedback = async () => {
    if (!user || !receiverId || !feedback) return alert('Fill in all fields');

    await addDoc(collection(db, 'feedback'), {
      from: user.uid,
      to: receiverId,
      text: feedback,
      createdAt: Timestamp.now(),
    });
    alert('Feedback submitted');
    setReceiverId('');
    setFeedback('');
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <Navbar />
      <main className="max-w-xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Leave Feedback</h1>
        <input
          className="w-full p-2 mb-4 rounded border"
          placeholder="Receiver User ID"
          value={receiverId}
          onChange={(e) => setReceiverId(e.target.value)}
        />
        <textarea
          className="w-full p-2 mb-4 rounded border"
          placeholder="Your feedback..."
          rows={5}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />
        <button
          onClick={submitFeedback}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Submit Feedback
        </button>
      </main>
    </div>
  );
}