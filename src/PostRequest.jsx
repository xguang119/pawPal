import { useState, useRef } from "react";
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
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUsername(user.email);
    };
    fetchUser();
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
        {/* Service type */}
        <label>Service Type:</label>
        <select value={service} onChange={(e) => setService(e.target.value)} required>
          <option value="">Select</option>
          <option value="Dog walking">Dog walking</option>
          <option value="Vaccinations">Vaccinations</option>
          <option value="Grooming">Grooming</option>
          <option value="Daycare">Daycare</option>
        </select>

        {/* Description */}
        <label>Description:</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={3}
        />

        {/* Contact Type */}
        <label>Contact Type:</label>
        <select value={contactType} onChange={(e) => setContactType(e.target.value)} required>
          <option value="">Select</option>
          <option value="email">Email</option>
          <option value="phone call">Phone Call</option>
        </select>

        {/* Contact Info */}
        <label>Contact Info:</label>
        <textarea
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          required
          rows={1}
        />

        {/* Date */}
        <label>Service Date:</label>
        <input
          type="text"
          placeholder="ex: Jan 1"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        {/* Time */}
        <label>Service Time:</label>
        <input
          type="text"
          placeholder="ex: 10 am to 3 pm"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          required
        />

        {/* Upload Image */}
        <label>Upload Photo (optional):</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          ref={fileInputRef}
        />

        <button type="submit" style={{ marginTop: '1rem' }}>Post Request</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}
