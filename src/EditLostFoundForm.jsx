import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from './supabaseClient';

export default function EditLostFoundForm() {
  const { id } = useParams();
  const [petType, setPetType] = useState('');
  const [status, setStatus] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [contact, setContact] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      const { data, error } = await supabase
        .from('lost_found_posts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        alert('Could not load post');
        console.error(error);
        return;
      }

      setPetType(data.pet_type);
      setStatus(data.status);
      setLocation(data.location);
      setDescription(data.description);
      setContact(data.contact);
      setLoading(false);
    };

    fetchPost();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    const { error } = await supabase
      .from('lost_found_posts')
      .update({
        pet_type: petType,
        status,
        location,
        description,
        contact,
      })
      .eq('id', id);

    if (error) {
      alert('Update failed: ' + error.message);
      console.error(error);
    } else {
      navigate('/lostfound');
    }
  };

  if (loading) return <p>Loading post...</p>;

  return (
    <form onSubmit={handleUpdate} style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <h2>Edit Lost/Found Post</h2>

      <label>Status:</label>
      <select value={status} onChange={(e) => setStatus(e.target.value)} required>
        <option>Lost</option>
        <option>Found</option>
      </select>
      <br /><br />

      <label>Pet Type:</label>
      <input
        type="text"
        value={petType}
        onChange={(e) => setPetType(e.target.value)}
        required
      />
      <br /><br />

      <label>Last Known Location:</label>
      <input
        type="text"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        required
      />
      <br /><br />

      <label>Description:</label>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />
      <br /><br />

      <label>Contact Info:</label>
      <input
        type="text"
        value={contact}
        onChange={(e) => setContact(e.target.value)}
        required
      />
      <br /><br />

      <button type="submit">Update</button>
    </form>
  );
}
