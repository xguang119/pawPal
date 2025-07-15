import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const [userEmail, setUserEmail] = useState('');
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email);

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
    <div style={{ padding: '2rem', maxWidth: '500px', margin: 'auto' }}>
      <h2>Your Profile</h2>

      <p><strong>Email:</strong> {userEmail}</p>

      {profile ? (
        <>
          <p><strong>User Name:</strong> {profile['User name']}</p>
          <p><strong>Phone:</strong> {profile.phone}</p>
          <p><strong>Location:</strong> {profile.location}</p>
          <p><strong>Pet Type:</strong> {profile['pet type']}</p>
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

      <div style={{ marginTop: '2rem' }}>
        <button onClick={() => navigate('/feed')} style={{ marginRight: '1rem' }}>
          Back to Feed
        </button>
        <button onClick={handleLogout} style={{ backgroundColor: '#f44336', color: 'white' }}>
          Logout
        </button>
      </div>
    </div>
  );
}
