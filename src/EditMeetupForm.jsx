import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';

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
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2>Edit Meetup</h2>
      <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <label>
          Title:
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>

        <label>
          Description:
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
        </label>

        <label>
          Location:
          <input value={location} onChange={(e) => setLocation(e.target.value)} required />
        </label>

        <label>
          Date & Time:
          <input
            type="datetime-local"
            value={datetime?.slice(0, 16)}
            onChange={(e) => setDatetime(e.target.value)}
            required
          />
        </label>

        <label>
        Pet Type:
        <input
            type="text"
            value={petType}
            onChange={(e) => setPetType(e.target.value)}
            required
        />
        </label>


        <label>
          Upload New Photo (optional):
          <input type="file" ref={fileInputRef} onChange={(e) => setImage(e.target.files[0])} />
        </label>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit">Update Meetup</button>
          <button type="button" onClick={() => navigate('/meetups')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditMeetupForm;
