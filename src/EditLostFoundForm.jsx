import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from './supabaseClient';
import './App.css';

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
      <h2 style={{ color: '#58bfbc', fontSize: '3rem', textAlign: 'center' }}>
        Edit Lost/Found Post
      </h2>
      <form onSubmit={handleUpdate}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label>Status:</label>
            <select
              className="pastel-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              required
            >
              <option>Lost</option>
              <option>Found</option>
              <option>Reunited</option>
            </select>
          </div>

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

          <div style={{ marginBottom: '1.25rem' }}>
            <label>Last Known Location:</label>
            <input
              className="pastel-input"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label>Description:</label>
            <textarea
              className="pastel-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label>Contact Info:</label>
            <input
              className="pastel-input"
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="pastel-button" style={{ marginTop: '1rem' }}>
            Update
          </button>
        </form>
      </div>
    </div>
  );
}