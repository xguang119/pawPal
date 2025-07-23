import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Meetups() {
  const [meetups, setMeetups] = useState([]);
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchUser();
    fetchMeetups();
  }, []);

  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setUser(user);
  };

  const fetchMeetups = async () => {
    const { data, error } = await supabase
      .from('meetups_posts')
      .select('*')
      .order('datetime', { ascending: true });

    if (!error) setMeetups(data);
    else console.error('Error fetching meetups:', error);
  };

  const toggleInterest = async (id, currentList = []) => {
    if (!user) return;

    let updatedList = Array.isArray(currentList) ? [...currentList] : [];

    if (updatedList.includes(user.id)) {
      updatedList = updatedList.filter((uid) => uid !== user.id);
    } else {
      updatedList.push(user.id);
    }

    const { error } = await supabase
      .from('meetups_posts')
      .update({ interested: updatedList })
      .eq('id', id);

    if (!error) fetchMeetups();
    else console.error('Failed to toggle RSVP:', error);
  };

  const deletePost = async (id) => {
    const confirm = window.confirm('Are you sure you want to delete this meetup?');
    if (!confirm) return;

    const { error } = await supabase
      .from('meetups_posts')
      .delete()
      .eq('id', id);

    if (!error) fetchMeetups();
    else alert('Error deleting meetup');
  };

  const filteredMeetups = meetups.filter((post) => {
    if (!filter) return true;
  
    if (filter === 'MyPosts' && user) {
      return post.user_id === user.id;
    }
  
    if (filter === 'Other') {
      const mainTypes = ['dog', 'cat', 'bird'];
      return !mainTypes.includes(post.pet_type.toLowerCase());
    }
  
    return post.pet_type.toLowerCase() === filter.toLowerCase();
  });
  

  return (
    <div className="gradient-custom" style={{ minHeight: '100vh', padding: '2rem 0' }}>
    <div style={{ 
      maxWidth: '850px', 
      margin: '20px auto',
      backgroundColor: '#fefefe',
      padding: '2rem',
      borderRadius: '16px',
      boxShadow: '0 6px 24px rgba(0, 0, 0, 0.12)',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '10px' }}>
        <button className="pastel-button" onClick={() => navigate('/feed')}>Back to Home</button>
        <button className="pastel-button" onClick={() => navigate('/meetupform')}>Post a Meetup</button>
      </div>

      <h2 style={{ color: '#58bfbc', fontSize: '3.25rem', textAlign: 'center', marginBottom: '2rem' }}>
        Pet Social Meetups
      </h2>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ marginRight: '0.5rem' }}>Filter by Pet Type:</label>
        <select className="pastel-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All</option>
          <option value="MyPosts">My Posts</option>
          <option value="Dog">Dog</option>
          <option value="Cat">Cat</option>
          <option value="Bird">Bird</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {filteredMeetups.length === 0 && <p>No meetups found.</p>}

      {filteredMeetups.map((meetup) => {
        const isInterested = Array.isArray(meetup.interested) && user && meetup.interested.includes(user.id);

        return (
          <div key={meetup.id} style={{ 
            border: '1px solid #e0e0e0',
            backgroundColor: '#f6efdb', 
            padding: '16px',
            borderRadius: '12px', 
            marginBottom: '20px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
          }}>
            {meetup.image_url && (
              <img
                src={meetup.image_url}
                alt="Meetup"
                style={{ width: '100%', marginBottom: '8px', borderRadius: '8px' }}
              />
            )}

            <p><strong>{meetup.title}</strong></p>
            <p><small>Pet Type:</small> {meetup.pet_type}</p>
            <p><small>Location:</small> {meetup.location}</p>
            <p><small>Date & Time:</small> {new Date(meetup.datetime).toLocaleString()}</p>
            <p><small>Description:</small> {meetup.description}</p>
            <p><small>Posted by:</small> {meetup.username}</p>
            <p style={{ fontSize: '0.8em', color: '#666' }}>
              Posted on: {new Date(meetup.created_at).toLocaleString()}
            </p>

            {user && (
              <button className="pastel-button" onClick={() => toggleInterest(meetup.id, meetup.interested)} style={{ marginTop: '0.5rem' }}>
                {isInterested ? 'Un-RSVP' : 'RSVP'}
              </button>
            )}

            {user && meetup.user_id === user.id && (
              <>
                <button className="pastel-button" onClick={() => navigate(`/edit-meetup/${meetup.id}`)} style={{ marginLeft: '8px', marginTop: '0.5rem' }}>
                  Edit
                </button>
                <button
                  className="pastel-button"
                  onClick={() => deletePost(meetup.id)}
                  style={{ marginLeft: '8px', marginTop: '0.5rem', backgroundColor: '#f77' }}
                >
                  Delete
                </button>
              </>
            )}

            <p style={{ marginTop: '0.5rem' }}>
              <small>{meetup.interested?.length || 0} people interested</small>
            </p>
          </div>
        );
      })}
    </div>
    </div>
  );
}