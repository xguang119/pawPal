import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const [userEmail, setUserEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: 'auto', textAlign: 'center' }}>
      <h2>Your Profile</h2>
      <p><strong>Email:</strong> {userEmail}</p>

      <div style={{ marginTop: '2rem' }}>
        <button onClick={() => navigate('/feed')} style={{ margin: '1rem' }}>
          Cancel
        </button>
        <button onClick={handleLogout} style={{ backgroundColor: '#f44336', color: 'white' }}>
          Logout
        </button>
      </div>
    </div>
  );
}
