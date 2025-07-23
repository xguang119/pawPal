import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function MyLostFound() {
  const [posts, setPosts] = useState([]);
  const [username, setUsername] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserAndPosts();
  }, []);

  const fetchUserAndPosts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUsername(user.email);

      const { data, error } = await supabase
        .from('lost_found_posts')
        .select('*')
        .eq('username', user.email)
        .order('created_at', { ascending: false });

      if (!error) setPosts(data);
      else console.error(error);
    }
  };

  const markAsFound = async (id) => {
    const { error } = await supabase
      .from('lost_found_posts')
      .update({ status: 'Found' })
      .eq('id', id);

    if (!error) fetchUserAndPosts();
  };

  const deletePost = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this post?");
    if (!confirm) return;

    const { error } = await supabase
      .from('lost_found_posts')
      .delete()
      .eq('id', id);

    if (!error) fetchUserAndPosts();
    else alert('Error deleting post');
  };

  return (
    <div style={{ maxWidth: '650px', margin: '40px auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <button onClick={() => navigate('/lostfound')}>← Back to Lost and Found Page</button>
        <button onClick={() => navigate('/lostfoundform')}>Post New</button>
      </div>

      <h2>My Lost & Found Posts</h2>

      {posts.length === 0 && <p>You haven't posted anything yet.</p>}
      {posts.map((post) => (
        <div key={post.id} style={{ border: '1px solid #ccc', padding: '12px', marginBottom: '12px' }}>
          {post.image_url && (
            <img
              src={post.image_url}
              alt="Lost/Found Pet"
              style={{ width: '100%', marginBottom: '8px' }}
            />
          )}
          <p style={{ fontWeight: 'bold', color: post.status === 'Found' ? 'green' : 'red' }}>
            {post.status} - {post.pet_type}
          </p>
          <p><em>Last seen at:</em> {post.location}</p>
          <p>{post.description}</p>
          <p><strong>Contact:</strong> {post.contact}</p>
          <p style={{ fontSize: '0.8em', color: '#666' }}>
            Posted on: {new Date(post.created_at).toLocaleString()}
          </p>

          <button onClick={() => navigate(`/editlostfound/${post.id}`)}>Edit</button>
          {post.status === 'Lost' && (
            <button onClick={() => markAsFound(post.id)} style={{ marginLeft: '10px' }}>
              Mark as Found
            </button>
          )}
          <button onClick={() => deletePost(post.id)} style={{ marginLeft: '10px', backgroundColor: '#FF6961' }}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
