import { useState,useEffect} from 'react';
import { supabase } from './supabaseClient';

const RATING_RANGE=5;//1~5

export default function ReviewForm({ requestId, helperId, onClose }) {
  const [rating, setRating] = useState(RATING_RANGE);//1~5，max score is 5
  const [comment, setComment] = useState('');//comment
  const [posterEmail, setPosterEmail] = useState('');//the poster's email， to identify user identity
  const [message, setMessage] = useState('');//message to show if success


  useEffect(() => {
    //get user info from supabase
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      //if not error, save
      if (!error && user) {
        setPosterEmail(user.email);
      }
    };
    fetchUser();
  }, []);
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    //try to check if already rate
    const { data: existingReviews, error: checkError } = await supabase
    .from('reviews')
    .select('*')
    .eq('request_id', requestId)
    .eq('poster_email', posterEmail);

    //if error, show error message
    if (checkError) {
      console.error('Review check failed:', checkError);
      setMessage('Failed to check existing review.');
      return;
    }

    //if already have review/rating, can't submit review again and show 'You have already submitted a review for this task.'
    if (existingReviews && existingReviews.length > 0) {
      setMessage('You have already submitted a review for this task.');
    return;
    }

    const { error } = await supabase.from('reviews').insert([
      {
        request_id: requestId,//post id num
        helper_email: helperId,//email(helper), who
        poster_email: posterEmail,//email(poster), who
        rating,//rating
        comment//review
      }
    ]);

    //if error show error message
    if (error) {
      setMessage('Failed to submit review.');
      console.error(error);
    } 
    //else
    else {
      setMessage('Review submitted successfully!');
      //close the window
      setTimeout(() => {
        onClose();
      }, 1000);
    }
  };

  //ui
  return (
    <div style={{
      background: '#f0f0f0',
      padding: '20px',
      borderRadius: '10px',
      maxWidth: '500px',
      margin: '20px auto'
    }}>

    {/*title*/}
      <h3>Rate Your Helper</h3>
      <form onSubmit={handleSubmit}>
        {/*rating*/}
        <label>Rating (1-5): </label>
        <select value={rating} onChange={(e) => setRating(Number(e.target.value))} required>
          <option value={5}>5 - Excellent</option>
          <option value={4}>4 - Good</option>
          <option value={3}>3 - Average</option>
          <option value={2}>2 - Poor</option>
          <option value={1}>1 - Terrible</option>
        </select>

        {/*review*/}
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

        {/*botton:submit and cancle*/}
        <div style={{ marginTop: '10px' }}>
          <button type="submit">Submit Review</button>
          <button type="button" onClick={onClose} style={{ marginLeft: '10px' }}>Cancel</button>
        </div>
        {message && <p>{message}</p>}
      </form>
    </div>
  );
}
