import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function PetsProfile() {
  const [pet, setPet] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPetProfile = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('Auth error or no session:', userError?.message);
        setLoading(false);
        return;
      }

      setUserId(user.id);

      const { data, error: fetchError } = await supabase
        .from('petprofile')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) {
        console.error('Fetch error:', fetchError.message);
      }

      setPet(data || null);
      setLoading(false);
    };

    fetchPetProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPet((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId || !pet) return;

    const newData = { ...pet, user_id: userId };

    const { error } = pet.id
      ? await supabase.from('petprofile').update(newData).eq('id', pet.id)
      : await supabase.from('petprofile').insert([newData]);

    if (!error) {
      alert(pet.id ? 'Pet profile updated!' : 'Pet profile created!');
      setIsEditing(false);
      navigate('/profile');
    } else {
      console.error('Error saving pet profile:', error.message);
    }
  };

  if (loading) return <p style={{ textAlign: 'center', marginTop: '2rem' }}>Loading...</p>;

  if (!pet) {
    return (
      <div style={{ textAlign: 'center', marginTop: '4rem', fontSize: '1.2rem' }}>
        <p>🐾 Your pet profile is empty.</p>
        <button
          style={{
            marginTop: '1rem',
            backgroundColor: '#1976d2',
            color: '#fff',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
          onClick={() => {
            setPet({
              pet_name: '',
              age: '',
              type: '',
              breed: '',
              notes: ''
            });
            setIsEditing(true);
          }}
        >
          Create Pet Profile
        </button>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '600px',
      margin: '2rem auto',
      backgroundColor: '#f9f9f9',
      padding: '2rem',
      borderRadius: '12px',
      boxShadow: '0 6px 18px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ textAlign: 'center', color: '#1976d2' }}>
        {isEditing ? (pet.id ? 'Edit Pet Profile' : 'Create Pet Profile') : 'Pet Profile'}
      </h2>

      {!isEditing ? (
        <div style={{ lineHeight: '1.8', fontSize: '1.1rem' }}>
          <p><strong>Name:</strong> {pet.pet_name}</p>
          <p><strong>Age:</strong> {pet.age}</p>
          <p><strong>Type:</strong> {pet.type}</p>
          <p><strong>Breed:</strong> {pet.breed}</p>
          <p><strong>Notes:</strong> {pet.notes || '—'}</p>

          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <button
              onClick={() => setIsEditing(true)}
              style={{
                backgroundColor: '#1976d2',
                color: '#fff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Edit Profile
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="text"
            name="pet_name"
            placeholder="Pet Name"
            value={pet.pet_name}
            onChange={handleChange}
            required
          />
          <input
            type="number"
            name="age"
            placeholder="Pet Age"
            value={pet.age}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="type"
            placeholder="Pet Type (e.g. Dog, Cat)"
            value={pet.type}
            onChange={handleChange}
          />
          <input
            type="text"
            name="breed"
            placeholder="Breed"
            value={pet.breed}
            onChange={handleChange}
          />
          <textarea
            name="notes"
            placeholder="Additional Notes"
            value={pet.notes}
            onChange={handleChange}
          />
          <button type="submit" style={{
            backgroundColor: '#1976d2',
            color: '#fff',
            border: 'none',
            padding: '10px',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}>
            {pet.id ? 'Update Profile' : 'Save Profile'}
          </button>
        </form>
      )}
    </div>
  );
}
