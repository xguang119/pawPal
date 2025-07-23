import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';
import './feed.css';

export default function Profile() {
  const [userEmail, setUserEmail] = useState('');
  const [profile, setProfile] = useState(null);
  const [averageRating, setAverageRating] = useState(null);
  const [reviewCount, setReviewCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (user) {
        setUserEmail(user.email);

        const { data: reviews, error: reviewError } = await supabase
          .from('reviews')
          .select('rating')
          .eq('helper_email', user.email);

        if (reviewError) {
          console.error('Review fetch error:', reviewError.message);
        } else if (reviews && reviews.length > 0) {
          const total = reviews.reduce((sum, r) => sum + r.rating, 0);
          const avg = (total / reviews.length).toFixed(1);
          setAverageRating(avg);
          setReviewCount(reviews.length);
        }

        const { data: profileData, error: profileError } = await supabase
          .from('profile')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Profile fetch error:', profileError.message);
        } else {
          setProfile(profileData);
        }
      } else if (error) {
        console.error('Auth error:', error.message);
      }
    };

    fetchUserProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="gradient-custom" style={{ minHeight: '100vh', padding: '2rem 0' }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        backgroundColor: '#f6efdb',
        padding: '2rem',
        borderRadius: '16px',
        boxShadow: '0 6px 24px rgba(0, 0, 0, 0.12)',
        fontFamily: 'Arial, sans-serif',
        textAlign: 'center'
      }}>
        <h2 style={{
          fontSize: '3rem',
          fontWeight: 'bold',
          color: '#58bfbc',
          marginBottom: '1.5rem'
        }}>Your Profile</h2>

        <p><strong>Email:</strong> {userEmail}</p>

        {profile ? (
          <>
            <p><strong>User Name:</strong> {profile['User name']}</p>
            <p><strong>Phone:</strong> {profile.phone}</p>
            <p><strong>Location:</strong> {profile.location}</p>
            <p><strong>Pet Type:</strong> {profile['pet type']}</p>
            <p><strong>Rating:</strong> {
              reviewCount > 0
                ? <>❤️ {averageRating} / 5 ({reviewCount} reviews)</>
                : <span style={{ color: '#777' }}>No reviews yet</span>
            }</p>

            {profile['profile pic'] && (
              <div style={{ marginTop: '1rem' }}>
                <img
                  src={profile['profile pic']}
                  alt="Profile"
                  style={{ width: '150px', height: '150px', borderRadius: '50%' }}
                />
              </div>
            )}
          </>
        ) : (
          <p>Loading profile...</p>
        )}

        <div style={{
          marginTop: '2rem',
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          <button
            className="pastel-button"
            onClick={() => navigate('/feed')}
          >
            Back to Feed
          </button>

          <button
            style={{
              backgroundColor: '#4CAF50',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              padding: '8px 16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
            onClick={() => navigate('/petsprofile')}
          >
            Pet Profile
          </button>

          <button
            style={{
              backgroundColor: '#f44336',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              padding: '8px 16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
