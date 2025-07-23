import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';
import './feed.css';

export default function LostAndFound() {
  const [posts, setPosts] = useState([]);
  const [username, setUsername] = useState('');
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUser();
    fetchPosts();
  }, []);

  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setUsername(user.email);
  };

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('lost_found_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setPosts(data);
    else console.error(error);
  };

  const markAsFound = async (postId) => {
    const { error } = await supabase
      .from('lost_found_posts')
      .update({ status: 'Found' })
      .eq('id', postId);

    if (!error) fetchPosts();
  };

  const deletePost = async (postId) => {
    const confirm = window.confirm("Are you sure you want to delete this post?");
    if (!confirm) return;

    const { error } = await supabase
      .from('lost_found_posts')
      .delete()
      .eq('id', postId);

    if (!error) fetchPosts();
    else alert('Error deleting post');
  };

  const filteredPosts = posts
    .filter((post) => {
      const pet = post.pet_type.toLowerCase();
      const status = post.status.toLowerCase();

      const matchesFilter =
        !filter ||
        (filter.toLowerCase() === 'other'
          ? pet !== 'dog' && pet !== 'cat' && pet !== 'bird'
          : pet === filter.toLowerCase());

      const matchesStatus = !statusFilter || status === statusFilter.toLowerCase();

      return matchesFilter && matchesStatus;
    })

  const sortedPosts = [...filteredPosts]
    .filter(post => post.status !== 'Reunited')
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .concat(filteredPosts.filter(post => post.status === 'Reunited'));

   



  return (
    <div className="gradient-custom" style={{ minHeight: '100vh', padding: '2rem 0' }}>
    <div style={{
      maxWidth: '850px',
      margin: '0 auto',
      backgroundColor: '#fefefe',
      padding: '2rem',
      borderRadius: '16px',
      boxShadow: '0 6px 24px rgba(0, 0, 0, 0.12)',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <button className="pastel-button" onClick={() => navigate('/feed')}>Back to Home</button>
        <button className="pastel-button" onClick={() => navigate('/lostfoundform')}>Post Lost/Found Pet</button>
      </div>

      <h2 style={{ color: '#58bfbc', fontSize: '3.75rem', textAlign: 'center' }}>Lost & Found Pets</h2>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <div>
          <label>Filter by Pet Type: </label>
          <select className="pastel-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">All</option>
            <option value="Dog">Dog</option>
            <option value="Cat">Cat</option>
            <option value="Bird">Bird</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label>Filter by Status: </label>
          <select className="pastel-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All</option>
            <option value="Lost">Lost</option>
            <option value="Found">Found</option>
          </select>
        </div>
      </div>

      {filteredPosts.length === 0 && <p>No matching lost/found posts found.</p>}

       {filteredPosts.map((post) => (
         <div key={post.id} style={{
            border: '1px solid #e0e0e0',
            backgroundColor: '#f6efdb',
            padding: '16px',
            borderRadius: '12px',
            marginBottom: '20px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
          }}>
            {post.image_url && (
              <img
                src={post.image_url}
                alt="Lost/Found Pet"
                style={{ width: '100%', borderRadius: '8px', marginBottom: '12px' }}
              />
            )}
            <p style={{ color: post.status === 'Reunited' ? 'green' : 'red', fontWeight: 'bold' }}>
              {post.status} - {post.pet_type}
           </p>
            <p><em>Last seen at:</em> {post.location}</p>
            <p><small>Description:</small> {post.description}</p>
            <p><small>Contact:</small> {post.contact}</p>
            <p><small>Posted by: {post.username}</small></p>
            <p style={{ fontSize: '0.8em', color: '#666' }}>
              Posted on: {new Date(post.created_at).toLocaleString()}
            </p>

            {post.username === username && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button className="pastel-button" onClick={() => navigate(`/editlostfound/${post.id}`)}>Edit</button>
                {post.status === 'Lost' && (
                  <button className="pastel-button" onClick={() => markAsFound(post.id)}>
                    Mark as Found
                 </button>
               )}
                <button className="pastel-button" style={{ backgroundColor: '#f77' }} onClick={() => deletePost(post.id)}>
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
