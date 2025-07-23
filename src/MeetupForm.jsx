import { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

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
    <form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <h2>Post a Pet Meetup</h2>

      <label>Title: </label>
      <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <br /><br />

      <label>Description: </label>
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
      <br /><br />

      <label>Location: </label>
      <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} required />
      <br /><br />

      <label>Date & Time: </label>
      <input type="datetime-local" value={datetime} onChange={(e) => setDatetime(e.target.value)} required />
      <br /><br />

      <label>Pet Type: </label>
      <input type="text" value={petType} onChange={(e) => setPetType(e.target.value)} required />
      <br /><br />

      <label>Upload Meetup Photo (optional): </label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files[0])}
        ref={fileInputRef}
      />
      <br /><br />

      <div>
        <button type="submit">Submit</button>
        <button
          type="button"
          onClick={() => navigate('/meetups')}
          style={{ marginLeft: '10px', backgroundColor: '#ccc' }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
