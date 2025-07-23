import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import './App.css';

const EditMeetupForm = () => {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [datetime, setDatetime] = useState('');
  const [petType, setPetType] = useState('');
  const [image, setImage] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMeetup = async () => {
      const { data, error } = await supabase
        .from('meetups_posts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching meetup:', error);
      } else {
        setTitle(data.title);
        setDescription(data.description);
        setLocation(data.location);
        setDatetime(data.datetime);
        setPetType(data.pet_type);
      }
    };

    fetchMeetup();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    let imageUrl = null;

    if (image) {
      const { data, error } = await supabase.storage
        .from('images')
        .upload(`meetups/${Date.now()}_${image.name}`, image);

      if (error) {
        alert('Image upload failed: ' + error.message);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from('images').getPublicUrl(data.path);

      imageUrl = publicUrl;
    }

    const updateFields = {
      title,
      description,
      location,
      datetime,
      pet_type: petType,
    };

    if (imageUrl) updateFields.image_url = imageUrl;

    const { error } = await supabase
      .from('meetups_posts')
      .update(updateFields)
      .eq('id', id);

    if (error) {
      alert('Error updating meetup: ' + error.message);
    } else {
      navigate('/meetups');
    }
  };

  return (
    <div className="gradient-custom" style={{ minHeight: '100vh', padding: '2rem 0' }}>
    <div style={{
      maxWidth: '700px',
      margin: '0 auto',
      backgroundColor: '#fefefe',
      padding: '2rem',
      borderRadius: '16px',
      boxShadow: '0 6px 24px rgba(0, 0, 0, 0.12)',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h2 style={{ color: '#58bfbc', fontSize: '3rem', textAlign: 'center', marginBottom: '1.5rem' }}>
        Edit Meetup
      </h2>
      <form onSubmit={handleUpdate}>
        {/* Title */}
        <div style={{ marginBottom: '1.25rem' }}>
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
        <div style={{ marginBottom: '1.25rem' }}>
          <label>Description:</label>
          <textarea
            className="pastel-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={3}
          />
        </div>

        {/* Location */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label>Location:</label>
          <input
            className="pastel-input"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>

        {/* Date & Time */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label>Date & Time:</label>
          <input
            className="pastel-input"
            type="datetime-local"
            value={datetime?.slice(0, 16)}
            onChange={(e) => setDatetime(e.target.value)}
            required
          />
        </div>

        {/* Pet Type */}
        <div style={{ marginBottom: '1.25rem' }}>
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
        <div style={{ marginBottom: '1.25rem' }}>
          <label>Upload New Photo (optional):</label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => setImage(e.target.files[0])}
          />
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '1.5rem' }}>
          <button type="submit" className="pastel-button">Update Meetup</button>
          <button
            type="button"
            className="pastel-button"
            style={{ backgroundColor: '#ccc' }}
            onClick={() => navigate('/meetups')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
    </div>
  );
}

export default EditMeetupForm;
