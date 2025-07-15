import { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

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
    <form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <h2>Post a Lost/Found Pet</h2>

      <label>Status: </label>
      <select value={status} onChange={(e) => setStatus(e.target.value)} required>
        <option>Lost</option>
        <option>Found</option>
      </select>
      <br /><br />

      <label>Pet Type: </label>
      <input type="text" value={petType} onChange={(e) => setPetType(e.target.value)} required />
      <br /><br />

      <label>Last Known Location: </label>
      <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} required />
      <br /><br />

      <label>Description: </label>
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
      <br /><br />

      <label>Contact Info: </label>
      <input
        type="text"
        value={contact}
        onChange={(e) => setContact(e.target.value)}
        placeholder="email, phone, etc."
        required
      />
      <br /><br />

      <label>Upload Pet Photo (optional): </label>
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
          onClick={() => navigate('/lostfound')}
          style={{ marginLeft: '10px', backgroundColor: '#ccc' }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
