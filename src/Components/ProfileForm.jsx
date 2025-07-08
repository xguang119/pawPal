import { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function ProfileForm() {
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [petType, setPetType] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { error } = await supabase.from('profiles').insert([
      {
        username,
        bio,
        location,
        pet_type: petType,
        avatar_url: avatarUrl
      }
    ]);

    if (error) {
      setMessage('Error: ' + error.message);
    } else {
      setMessage('Profile submitted!');
      setUsername('');
      setBio('');
      setLocation('');
      setPetType('');
      setAvatarUrl('');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
      <h2>Create a Profile</h2>
      <input
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
        style={{ display: 'block', marginBottom: '0.5rem', width: '100%' }}
      />
      <input
        placeholder="Location"
        value={location}
        onChange={e => setLocation(e.target.value)}
        style={{ display: 'block', marginBottom: '0.5rem', width: '100%' }}
      />
      <input
        placeholder="Pet Type"
        value={petType}
        onChange={e => setPetType(e.target.value)}
        style={{ display: 'block', marginBottom: '0.5rem', width: '100%' }}
      />
      <input
        placeholder="Avatar URL"
        value={avatarUrl}
        onChange={e => setAvatarUrl(e.target.value)}
        style={{ display: 'block', marginBottom: '0.5rem', width: '100%' }}
      />
      <textarea
        placeholder="Bio"
        value={bio}
        onChange={e => setBio(e.target.value)}
        rows={3}
        style={{ display: 'block', marginBottom: '1rem', width: '100%' }}
      />
      <button type="submit">Save Profile</button>
      {message && <p>{message}</p>}
    </form>
  );
}
