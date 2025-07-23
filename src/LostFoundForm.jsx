import { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';
import './App.css';

export default function LostFoundForm() {
  const [petType, setPetType] = useState('');
  const [status, setStatus] = useState('Lost');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [contact, setContact] = useState('');
  const [username, setUsername] = useState('');
  const [image, setImage] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUsername(user.email);
    };
    fetchUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    let imageUrl = null;

    if (image) {
      const { data, error } = await supabase.storage
        .from('image')
        .upload(`lostfound/${Date.now()}-${image.name}`, image);

      if (error) {
        alert('Image upload failed: ' + error.message);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('image')
        .getPublicUrl(data.path);

      imageUrl = urlData.publicUrl;
    }

    const { error } = await supabase.from('lost_found_posts').insert([
      {
        pet_type: petType,
        status,
        location,
        description,
        contact,
        username,
        image_url: imageUrl,
      },
    ]);

    if (error) {
      alert('Error posting lost/found pet: ' + error.message);
    } else {
      setPetType('');
      setStatus('Lost');
      setLocation('');
      setDescription('');
      setContact('');
      setImage(null);
      if (fileInputRef.current) fileInputRef.current.value = null;
      navigate('/lostfound');
    }
  };

  return (
    <div className="gradient-custom" style={{ minHeight: '100vh', padding: '2rem 0' }}>
      <div style={{
        maxWidth: '700px',
        margin: '0 auto',
        backgroundColor: '#f6efdb',
        padding: '2rem',
        borderRadius: '16px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        fontFamily: 'Poppins, sans-serif'
    }}>
      <h2 style={{
        fontWeight: 900,
        fontSize: '3rem',
        textAlign: 'center',
        marginBottom: '2rem',
        color: '#58bfbc'
      }}>
        Post a Lost/<span style={{ color: '#58bfbc' }}>Found Pet</span>
      </h2>

      <form onSubmit={handleSubmit}>
        {/* Status */}
        <div style={{ marginBottom: '1rem' }}>
          <label>Status: </label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} required>
            <option>Lost</option>
            <option>Found</option>
          </select>
        </div>

        {/* Pet Type */}
        <div style={{ marginBottom: '1rem' }}>
          <label>Pet Type: </label>
          <input
            type="text"
            value={petType}
            onChange={(e) => setPetType(e.target.value)}
            required
          />
        </div>

        {/* Location */}
        <div style={{ marginBottom: '1rem' }}>
          <label>Last Known Location: </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>

        {/* Description */}
        <div style={{ marginBottom: '1rem' }}>
          <label>Description: </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={2}
          />
        </div>

        {/* Contact */}
        <div style={{ marginBottom: '1rem' }}>
          <label>Contact Info: </label>
          <input
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="email, phone, etc."
            required
          />
        </div>

        {/* Upload */}
        <div style={{ marginBottom: '1rem' }}>
          <label>Upload Pet Photo (optional): </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            ref={fileInputRef}
          />
        </div>

        {/* Buttons */}
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button type="submit" className="pastel-button post-button">Submit</button>
          <button
            type="button"
            onClick={() => navigate('/lostfound')}
            style={{
              marginLeft: '10px',
              padding: '10px 32px',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              backgroundColor: '#ccc',
              border: '1px solid #999',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
);
}