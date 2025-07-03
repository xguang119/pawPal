import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_KEY
);

function App() {
  const [title, setTitle] = useState('');
  const [context, setContext] = useState('');
  const [posts, setPosts] = useState([]);

  const fetchPosts = async () => {
    const { data } = await supabase
      .from('posts') // replace with your table name
      .select('*')
      .order('created_at', { ascending: false });

    setPosts(data);
  };

  const submitPost = async () => {
    if (!title || !context) return;
    await supabase
      .from('posts')
      .insert([{ title, context }]);

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
          <p>{post.context}</p>
          <small>{new Date(post.created_at).toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
}

export default App;

