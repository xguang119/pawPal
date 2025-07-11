import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

function CompleteProfile({ onComplete }) {
  const [formData, setFormData] = useState({
    phone: '',
    username: '',
    location: '',
    petType: '',
  });
  const [user, setUser] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get current logged-in user
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        setErrorMsg("Failed to get current user");
      } else {
        setUser(data.user);
      }
    };

    fetchUser();
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setErrorMsg('');

    const { username, phone, location, petType } = formData;

    const { error } = await supabase.from('profile').insert([
      {
        id: user.id,
        "User name": username,
        phone: phone,
        location: location,
        "pet type": petType,
        "profile pic": '', // optional
        email: user.email,
      },
    ]);
    

    if (error) {
      setErrorMsg(error.message);
    } else {
      onComplete && onComplete(user); // optional callback
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Complete Your Profile</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="User Name"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
        />
        <input
          type="text"
          name="location"
          placeholder="Location"
          value={formData.location}
          onChange={handleChange}
        />
        <input
          type="text"
          name="petType"
          placeholder="Pet Type (e.g., Dog, Cat)"
          value={formData.petType}
          onChange={handleChange}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
        {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
      </form>
    </div>
  );
}

export default CompleteProfile;
