import { useState, useRef, useEffect } from "react"; // add useEffect here
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function PostRequest() {
  const [service, setService] = useState('');
  const [description, setDescription] = useState('');
  const [contact, setContact] = useState('');
  const [contactType, setContactType] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Fetch logged-in user email
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUsername(user.email);
      }
    };
    getUser();
  }, []);

  const submitTask = async (e) => {
    e.preventDefault();

    if (!service || !description || !contact || !date || !time) {
      setMessage('Please fill in all required fields');
      return;
    }

    let imageUrl = null;
    if (image) {
      const { data, error } = await supabase.storage
        .from('image')
        .upload(`public/${Date.now()}-${image.name}`, image);

      if (error) {
        setMessage('Image upload failed!');
        return;
      }

      const { data: urlData } = supabase.storage.from('image').getPublicUrl(data.path);
      imageUrl = urlData.publicUrl;
    }

    const { error: insertError } = await supabase.from('requests').insert([{
      service,
      description,
      contact,
      contact_type: contactType,
      date,
      time,
      image_url: imageUrl,
      status: 'pending',
      username
    }]);

    if (insertError) {
      setMessage('Failed to post request.');
      return;
    }

    setMessage('Successfully posted!');
    // Reset form fields
    setService('');
    setDescription('');
    setContact('');
    setContactType('');
    setDate('');
    setTime('');
    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  return (
    <div style={{ maxWidth: '650px', margin: '40px auto' }}>
      <button onClick={() => navigate('/feed')}>Back to Feed</button>

      <h2>Post a New Request</h2>
      <form onSubmit={submitTask}>
        <label>Service Type:</label>
        <select value={service} onChange={(e) => setService(e.target.value)} required>
          <option value="">Select</option>
          <option value="Dog walking">Dog walking</option>
          <option value="Vaccinations">Vaccinations</option>
          <opti
