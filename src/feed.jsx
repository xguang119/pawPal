import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { useNavigate } from "react-router-dom";
import { sendAcceptanceEmail } from './sendEmail';


export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [username, setUsername] = useState('');
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();
  const [filterByCity, setFilterByCity] = useState(false);//controls whether to filter requests by city
  const [userLocation, setUserLocation] = useState('');//user location info


  // Fetch posts
  useEffect(() => {
    fetchPosts();
    fetchUser();
  }, []);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setPosts(data);
    else console.error(error);
  };

  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUsername(user.email);
  
      const { data, error } = await supabase
        .from('profile')
        .select('location')
        .eq('email', user.email)
        .single();
  
      if (!error && data?.location) {
        setUserLocation(data.location);
      }
    }
  };

  const handleStatusChange = async (post) => {
    // If you're the poster and someone accepted → cancel
    if (post.username === username && post.status === 'Accepted by helper') {
      await supabase
        .from('requests')
        .update({ status: 'pending', helper: null })
        .eq('id', post.id);
    }

    // If you're the helper and accepted → cancel
    else if (post.helper === username && post.status === 'Accepted by helper') {
      await supabase
        .from('requests')
        .update({ status: 'pending', helper: null })
        .eq('id', post.id);
    }

    // If post is unclaimed and not yours → accept
    else if (post.status === 'pending' && post.username !== username) {
      await supabase
        .from('requests')
        .update({ status: 'Accepted by helper', helper: username })
        .eq('id', post.id);
        await sendAcceptanceEmail(post); //send email
    }

    fetchPosts();
  };

  const filteredPosts = posts.filter(post => {
    //try to ignore the case
    if (filterByCity &&  post.location?.toLowerCase() !== userLocation?.toLowerCase() ) return false;
    if (filter === 'all') return true;
    if (filter === 'pending') return post.status === 'pending';
    if (filter === 'mine') return post.username === username;
    return post.service === filter;
  });

  return (
    <div style={{ maxWidth: '650px', margin: '40px auto' }}>
      {/* Top Navigation Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <button onClick={() => navigate('/request')}>Post a New Request</button>
        <button onClick={() => navigate('/profile')}>Go to Profile</button>
        <button onClick={() => navigate('/lostfound')}>Lost and Found</button>
      </div>

      {/* Filter Controls */}
      <div style = {{marginBottom: '1rem' }}>
        <label>Filter: </label>
        <select value = {filter} onChange={(e) => setFilter(e.target.value)}>
          <option value ="all">Show All</option>
          <option value ="pending">Pending</option>
          <option value ="mine">My Posts</option>
          <option value ="Dog walking">Dog walking</option>
          <option value ="Vaccinations">Vaccinations</option>
          <option value ="Grooming">Grooming</option>
          <option value ="Daycare">Daycare</option>
        </select>
      </div>

      {/* city filter */}
      <div style={{ marginTop: '0.5rem' }}>
        <label>
          <input
            type="checkbox"
            checked={filterByCity}
            onChange={(e) => setFilterByCity(e.target.checked)}
          />
          {/* the location in () is your location */}
          {' '}Only show requests in my city ({userLocation || 'loading...'})
        </label>
      </div>

      

      <h2>Recent Requests</h2>

      {filteredPosts.length === 0 && <p>No matching requests found.</p>}
      {filteredPosts.map((post) => (
        <div key={post.id} style={{ border: '1px solid #ccc', padding: '12px', marginBottom: '12px' }}>
          {post.image_url && <img src={post.image_url} alt="Request" style={{ width: '100%', marginBottom: '8px' }} />}
          <p><strong>{post.service}</strong> · {post.date} {post.time}</p>
          <p>{post.description}</p>
          <p>Contact ({post.contact_type}): {post.contact}</p>
          <p>Status: {post.status === 'pending' ? 'Not accepted yet' : 'Accepted'}</p>
          <p>Posted by: {post.username || 'Unknown'}</p>
          {post.helper && <p style={{ fontSize: '0.8em', color: '#007700' }}>Accepted by: {post.helper}</p>}
          <button onClick={() => handleStatusChange(post)} style={{ marginTop: '0.5rem' }}>
            {
              post.status === 'Accepted by helper'
                ? 'Cancel'
                : (post.username !== username ? 'Accept' : 'Waiting...')
            }
          </button>
        </div>
      ))}
    </div>
  );
}
