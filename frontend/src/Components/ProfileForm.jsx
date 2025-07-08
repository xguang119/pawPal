import { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function ProfileForm() {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [petType, setPetType] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { error } = await supabase.from('profiles').insert([
      { name, bio, location, pet_type: petType },
    ]);

    if (error) {
      setMessage('Error: ' + error.message);
    } else {
      setMessage('Profile submitted!');
      setName('');
      setBio('');
      setLocation('');
      setPetType('');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
      <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} style={{ display: 'block', marginBottom: '0.5rem', width: '100%' }} />
      <input placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} style={{ display: 'block', marginBottom: '0.5rem', width: '100%' }} />
      <input placeholder="Pet Type (optional)" value={petType} onChange={e => setPetType(e.target.value)} style={{ display: 'block', marginBottom: '0.5rem', width: '100%' }} />
      <textarea placeholder="Bio" value={bio} onChange={e => setBio(e.target.value)} rows={3} style={{ display: 'block', marginBottom: '1rem', width: '100%' }} />
      <button type="submit">Save Profile</button>
      {message && <p>{message}</p>}
    </form>
  );
}
