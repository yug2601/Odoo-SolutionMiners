import { useState } from 'react';
import { db } from '../utils/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

export default function SwapFeedback({ to }: { to: string }) {
  const [text, setText] = useState('');

  const submit = async () => {
    if (!text) return alert('Please write some feedback');
    await addDoc(collection(db, 'feedback'), {
      to,
      text,
      createdAt: Timestamp.now(),
    });
    alert('Feedback submitted');
    setText('');
  };

  return (
    <div className="space-y-2 mt-2">
      <textarea
        className="w-full p-2 rounded border"
        placeholder="Write your feedback..."
        rows={3}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        onClick={submit}
        className="px-4 py-1 bg-blue-500 text-white rounded"
      >
        Submit Feedback
      </button>
    </div>
  );
}