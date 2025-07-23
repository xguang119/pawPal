import { useState, useRef, useEffect } from "react";
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';
import './App.css';

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
  const backTofeed = () => navigate('/feed');

  // Fetch logged-in user's email
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

      const { data: urlData } = supabase.storage
        .from('image')
        .getPublicUrl(data.path);

      imageUrl = urlData.publicUrl;
    }

    const { data: { user } } = await supabase.auth.getUser();
    const { data: profileData, error: profileError } = await supabase
      .from("profile")
      .select("location")
      .eq("id", user.id)//id=user id to confirm who is that
      .single()

    //if not exit
    if (profileError || !profileData) {
      console.error("Failed to fetch location from profile:", profileError);
      return;
    }
//get location
const userLocation = profileData.location

    const { error: insertError } = await supabase.from('requests').insert([{
      service,
      description,
      contact,
      contact_type: contactType,
      date,
      time,
      image_url: imageUrl,
      status: 'pending',
      username,
      location: userLocation,//add location to request form
    }]);

    if (insertError) {
      setMessage('Failed to post request.');
      return;
    }

    setMessage('Successfully posted!');
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
        <div className="gradient-custom" style={{
            minHeight: '100vh',
            padding: '2rem 0',
            //maxWidth : '650px', 
            //margin:'40px auto',
            }}>
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
                     <button className="pastel-button" onClick={backTofeed}>Cancel</button>
                  </div>
            <h2 style={{
                fontFamily: 'Arial, sans-serif',
                fontSize: '3.5rem',
                fontWeight: 'bold',
                textAlign: 'center',
                color: '#444',
                marginBottom: '24px'}}>
                Post the Request~
            </h2>
            <form onSubmit={submitTask}>
                {/*What kind of service --------- could change*/}
                <div style={{ marginBottom: '12px' }}>
                <label>Service Type: </label>
                <select value={service} onChange={(task)=>setService(task.target.value)}required>
                    <option value="">(Please select)</option>
                    <option value="Dog walking">Dog walking</option>
                    <option value="Vaccinations">Vaccinations</option>
                    <option value="Grooming">Grooming</option>
                    <option value="Daycare">Daycare</option>        
                </select>
                </div>
                
                {/*Describe the task*/}
                <div style={{ marginBottom: '12px' }}>
                <label>Description: </label>
                <textarea
                placeholder="Describe your task..."
                value={description}
                onChange={(task)=>setDescription(task.target.value)}
                rows={1}
                required
                />
                </div>

                {/*How to contact? emial or phone number*/}
                <div style={{ marginBottom: '12px' }}>
                <label>How would you like us to contact you ?:</label>
                <select value={contactType} onChange={(task)=>setContactType(task.target.value)}required>
                <option value="">(Please select)</option>
                <option value="email">email</option>
                <option value="phone call">phone call</option>
                </select>
                </div>

                {/*contact info*/}
                <div style={{ marginBottom: '12px' }}>
                <label>Please enter your contact Information: </label>
                <textarea
                placeholder="..."
                value={contact}
                onChange={(task)=>setContact(task.target.value)}
                rows={1}
                required
                />
                </div>

                {/*Date*/}
                <div style={{ marginBottom: '12px' }}>
                <label>Service Date: </label>
                <textarea
                placeholder="ex:Jan 1"
                value={date}
                onChange={(task)=>setDate(task.target.value)}
                rows={1}
                required
                />
                </div>

                {/*Time*/}
                <div style={{ marginBottom: '12px' }}>
                <label>Service Time: </label>
                <textarea
                placeholder="ex:10 am to 3 pm"
                value={time}
                onChange={(task)=>setTime(task.target.value)}
                rows={1}
                required
                />
                </div>

                {/*Photo?*/}
                <div style={{ marginBottom: '12px' }}>
                <label>Upload Photo(optional): </label>
                <input
                type="file"
                accept="image/*"
                onChange={(task)=>setImage(task.target.files[0])}
                ref={fileInputRef}
                />
                </div>

                {/*Submit botton*/}
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                 <button type="submit" className="pastel-button post-button">Post</button>
                </div>
            </form>
            {message && <p>{message}</p>}
          </div>
    </div>
  );
}
