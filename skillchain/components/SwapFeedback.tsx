import { useState } from 'react';
import { db } from '../utils/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

export default function SwapFeedback({ to }: { to: string }) {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!text) {
      setError('Please write some feedback');
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      await addDoc(collection(db, 'feedback'), {
        to,
        text,
        createdAt: Timestamp.now(),
      });
      alert('Feedback submitted successfully!');
      setText('');
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-2 mt-2 card p-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm animate-fade-in">
          {error}
        </div>
      )}
      <textarea
        className="input min-h-[80px] resize-none"
        placeholder="Write your feedback..."
        rows={3}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        onClick={submit}
        disabled={submitting}
        className="btn btn-primary w-full"
      >
        {submitting ? 'Submitting...' : 'Submit Feedback'}
      </button>
    </div>
  );
}