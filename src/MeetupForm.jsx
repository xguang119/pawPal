import { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';
import './App.css';

export default function MeetupForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [datetime, setDatetime] = useState('');
  const [petType, setPetType] = useState('');
  const [image, setImage] = useState(null);
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUsername(user.email);
        setUserId(user.id);
      }
    };
    fetchUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    let imageUrl = null;

    if (image) {
      const { data, error } = await supabase.storage
        .from('image')
        .upload(`meetups/${Date.now()}-${image.name}`, image);

      if (error) {
        alert('Image upload failed: ' + error.message);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('image')
        .getPublicUrl(data.path);

      imageUrl = urlData.publicUrl;
    }

    const { error } = await supabase.from('meetups_posts').insert([
      {
        title,
        description,
        location,
        datetime,
        pet_type: petType,
        image_url: imageUrl,
        user_id: userId,          
        username,                 
        interested: [],
      },
    ]);
    

    if (error) {
      alert('Error posting meetup: ' + error.message);
    } else {
      setTitle('');
      setDescription('');
      setLocation('');
      setDatetime('');
      setPetType('');
      setImage(null);
      if (fileInputRef.current) fileInputRef.current.value = null;
      navigate('/meetups');
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
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="pastel-button" onClick={() => navigate('/meetups')}>Cancel</button>
      </div>

      <h2 style={{
        fontFamily: 'Arial, sans-serif',
        fontSize: '3.5rem',
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#444',
        marginBottom: '24px'
      }}>
        Post a Pet Meetup
      </h2>

      <form onSubmit={handleSubmit}>
        {/* Title */}
        <div style={{ marginBottom: '12px' }}>
          <label>Title:</label>
          <input
            className="pastel-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Description */}
        <div style={{ marginBottom: '12px' }}>
          <label>Description:</label>
          <textarea
            className="pastel-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            required
          />
        </div>

        {/* Location */}
        <div style={{ marginBottom: '12px' }}>
          <label>Location:</label>
          <input
            className="pastel-input"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>

        {/* DateTime */}
        <div style={{ marginBottom: '12px' }}>
          <label>Date & Time:</label>
          <input
            className="pastel-input"
            type="datetime-local"
            value={datetime}
            onChange={(e) => setDatetime(e.target.value)}
            required
          />
        </div>

        {/* Pet Type */}
        <div style={{ marginBottom: '12px' }}>
          <label>Pet Type:</label>
          <input
            className="pastel-input"
            type="text"
            value={petType}
            onChange={(e) => setPetType(e.target.value)}
            required
          />
        </div>

        {/* Image Upload */}
        <div style={{ marginBottom: '12px' }}>
          <label>Upload Meetup Photo (optional):</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            ref={fileInputRef}
          />
        </div>

        {/* Submit */}
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button type="submit" className="pastel-button post-button">Submit</button>
        </div>
      </form>
    </div>
    </div>
  );
}
