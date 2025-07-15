import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

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
    .filter(
      (post) =>
        (!filter || post.pet_type.toLowerCase() === filter.toLowerCase()) &&
        (!statusFilter || post.status.toLowerCase() === statusFilter.toLowerCase())
    )
    .sort((a, b) => {
      // 1. Put LOST before FOUND
      if (a.status === 'Found' && b.status !== 'Found') return 1;
      if (a.status !== 'Found' && b.status === 'Found') return -1;

      // 2. Within same status, sort by newest first
      return new Date(b.created_at) - new Date(a.created_at);
    });


  return (
    <div style={{ maxWidth: '650px', margin: '40px auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <button onClick={() => navigate('/feed')}>Back to Home</button>
        <button onClick={() => navigate('/mylostfound')}>My Posts</button>
        <button onClick={() => navigate('/lostfoundform')}>Post Lost/Found Pet</button>
      </div>

      <h2>Lost and Found Pet Feed</h2>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label>Filter by Pet Type: </label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">All</option>
            <option value="Dog">Dog</option>
            <option value="Cat">Cat</option>
            <option value="Bird">Bird</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label>Filter by Status: </label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All</option>
            <option value="Lost">Lost</option>
            <option value="Found">Found</option>
          </select>
        </div>
      </div>

      {filteredPosts.length === 0 && <p>No matching lost/found posts found.</p>}
      {filteredPosts.map((post) => (
        <div key={post.id} style={{ border: '1px solid #ccc', padding: '12px', marginBottom: '12px' }}>
          {post.image_url && (
            <img
              src={post.image_url}
              alt="Lost/Found Pet"
              style={{ width: '100%', marginBottom: '8px' }}
            />
          )}
          <p style={{ color: post.status === 'Found' ? 'green' : 'red', fontWeight: 'bold' }}>
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
            <>
              <button onClick={() => navigate(`/editlostfound/${post.id}`)}>Edit</button>
              {post.status === 'Lost' && (
                <button style={{ marginLeft: '8px' }} onClick={() => markAsFound(post.id)}>
                  Mark as Found
                </button>
              )}
              <button style={{ marginLeft: '8px', backgroundColor: '#f77' }} onClick={() => deletePost(post.id)}>
                Delete
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
