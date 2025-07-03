import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_KEY
);

function App() {
  const [username, setUsername] = useState('');
  const [title, setTitle] = useState('');
  const [context, setContext] = useState('');
  const [posts, setPosts] = useState([]);

  const fetchPosts = async () => {
    const { data } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    setPosts(data || []);
  };

  const submitPost = async () => {
    if (!username || !title || !context) return;
    await supabase
      .from('posts')
      .insert([{ username, title, context }]);

    setUsername('');
    setTitle('');
    setContext('');
    fetchPosts();
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>pawPal</h1>
      <input
        placeholder="Your Name"
        value={username}
        onChange={e => setUsername(e.target.value)}
        style={{ display: 'block', marginBottom: '0.5rem', width: '100%' }}
      />
      <input
        placeholder="Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        style={{ display: 'block', marginBottom: '0.5rem', width: '100%' }}
      />
      <textarea
        placeholder="Context"
        value={context}
        onChange={e => setContext(e.target.value)}
        rows={4}
        style={{ display: 'block', marginBottom: '1rem', width: '100%' }}
      />
      <button onClick={submitPost}>Submit</button>

      <hr />

      {posts.map(post => (
        <div key={post.id} style={{ marginBottom: '1rem' }}>
          <strong>{post.title}</strong>
          <em> by {post.username || 'Anonymous'}</em>
          <p>{post.context}</p>
          <small>{new Date(post.created_at).toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
}

export default App;

