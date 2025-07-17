import { useState,useEffect} from 'react';
import { supabase } from './supabaseClient';

export default function ReviewForm({ requestId, helperId, onClose }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [posterEmail, setPosterEmail] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (!error && user) {
        setPosterEmail(user.email);
      }
    };
    fetchUser();
  }, []);
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { error } = await supabase.from('reviews').insert([
      {
        request_id: requestId,
        helper_email: helperId,
        poster_email: posterEmail,
        rating,
        comment
      }
    ]);

    if (error) {
      setMessage('Failed to submit review.');
      console.error(error);
    } else {
      setMessage('Review submitted successfully!');
      setTimeout(() => {
        onClose();
      }, 1000);
    }
  };

  return (
    <div style={{
      background: '#f0f0f0',
      padding: '20px',
      borderRadius: '10px',
      maxWidth: '500px',
      margin: '20px auto'
    }}>
      <h3>Rate Your Helper</h3>
      <form onSubmit={handleSubmit}>
        <label>Rating (1-5): </label>
        <select value={rating} onChange={(e) => setRating(Number(e.target.value))} required>
          <option value={5}>5 - Excellent</option>
          <option value={4}>4 - Good</option>
          <option value={3}>3 - Average</option>
          <option value={2}>2 - Poor</option>
          <option value={1}>1 - Terrible</option>
        </select>

        <div style={{ marginTop: '10px' }}>
          <label>Comment (optional): </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Say something about the helper..."
            rows={3}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginTop: '10px' }}>
          <button type="submit">Submit Review</button>
          <button type="button" onClick={onClose} style={{ marginLeft: '10px' }}>Cancel</button>
        </div>
        {message && <p>{message}</p>}
      </form>
    </div>
  );
}
