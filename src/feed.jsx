import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { useNavigate } from "react-router-dom";
import { sendAcceptanceEmail } from './sendEmail';
import ReviewForm from './ReviewForm';
import './feed.css';

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [username, setUsername] = useState('');
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();
  const [filterByCity, setFilterByCity] = useState(false);//controls whether to filter requests by city
  const [userLocation, setUserLocation] = useState('');//user location info
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [helperRatings, setHelperRatings] = useState({});
  const [helperReviews, setHelperReviews] = useState({});
  //try to seperate pages
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;// 6 tasks per page

  // Fetch posts
  useEffect(() => {
    fetchPosts();
    fetchUser();
    fetchHelperRatings();
  }, []);

  //start from first page
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, filterByCity]);

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

  // Handle status change

  const handleStatusChange = async (post) => {
    // If you're the poster and someone accepted -- cancel
    if (post.username === username && post.status === 'Accepted by helper') {
      const { data: reviews, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('request_id', post.id);

    if (error) {
      console.error('Error checking review:', error);
      return;
    }

    if (reviews && reviews.length > 0) {
      alert("You have already reviewed this helper. You can't cancel this task.");
      return;
    }

      await supabase
        .from('requests')
        .update({ status: 'pending', helper: null })
        .eq('id', post.id);
    }

    // If you're the helper and accepted -- cancel
    else if (post.helper === username && post.status === 'Accepted by helper') {
      await supabase
        .from('requests')
        .update({ status: 'pending', helper: null })
        .eq('id', post.id);
    }

    // If post is unclaimed and not yours -- accept
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
    if (filterByCity &&  post.location?.toLowerCase() !== userLocation?.toLowerCase() ) return false;
    if (filter === 'all') return true;
    if (filter === 'pending') return post.status === 'pending';
    if (filter === 'mine') return post.username === username;
    return post.service === filter;
  });
  //paging feature
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  //get all the rating and reciew
  const fetchHelperRatings = async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('helper_email, rating, comment, request_id');
  
    if (error) {
      console.error('Rating fetch error:', error);
      return;
    }
  
    const ratingMap = {};//save helper's rate and num of review
    const reviewMap = {};//save review
  
    data.forEach(({ helper_email, rating, comment, request_id }) => {

      if (!ratingMap[helper_email]) {
        ratingMap[helper_email] = { total: 0, count: 0 };
      }
      ratingMap[helper_email].total += rating;
      ratingMap[helper_email].count += 1;

      if (!reviewMap[request_id]) {
        reviewMap[request_id] = [];
      }
      reviewMap[request_id].push({ rating, comment });
    });

    //calculate the average score
    const avgMap = {};
    for (const email in ratingMap) {
      const { total, count } = ratingMap[email];
      avgMap[email] = {
        average: (total / count).toFixed(1),
        count//amount
      };
    }
  
    setHelperRatings(avgMap);
    setHelperReviews(reviewMap);
  };

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
      {/* Top Navigation Buttons */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
        <button className="pastel-button" onClick={() => navigate('/request')}>Post a New Request</button>
        <button className="pastel-button" onClick={() => navigate('/profile')}>Go to Profile</button>
        <button className="pastel-button" onClick={() => navigate('/lostfound')}>Lost and Found</button>
        <button className="pastel-button" onClick={() => navigate('/meetups')}>Find Pet Meetups</button>

      </div>

      {/* Filter Controls */}
      <div style = {{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', alignItems: 'center' }}>
        <div>
          <label style={{marginRight: '0.5rem'}}>Filter: </label>
          <select
           className="pastel-select"
           value = {filter} 
           onChange={(e) => setFilter(e.target.value)}
          >
            <option value ="all">Show All</option>
            <option value ="pending">Pending</option>
            <option value ="mine">My Posts</option>
            <option value ="Dog walking">Dog walking</option>
            <option value ="Vaccinations">Vaccinations</option>
            <option value ="Grooming">Grooming</option>
            <option value ="Daycare">Daycare</option>
          </select>
        </div>

      {/* city filter -----need to format this*/}
      <label style={{ marginTop: '0.5rem' }}>
          <input
            type="checkbox"
            checked={filterByCity}
            onChange={(e) => setFilterByCity(e.target.checked)}
          />
          {/* the location in () is your location */}
          {' '}Only show requests in my city ({userLocation || 'loading...'})
        </label>
      </div>

      <h2 style={{ color: '#58bfbc', fontSize: '3.75rem', textAlign: 'center' }}>Community Requests</h2>

      {filteredPosts.length === 0 && <p>No matching requests found.</p>}

           {/* Posts UI */}
      {currentPosts.map((post) => (
        <div key={post.id} style={{ 
            border: '1px solid #e0e0e0',
            backgroundColor: '#f6efdb', 
            padding: '16px',
           borderRadius: '12px', 
           marginBottom: '20px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
          }}>

          {post.image_url && <img src={post.image_url} alt="Request" style={{ width: '100%', marginBottom: '8px' }} />}
          <p><strong>{post.service}</strong> · {post.date} {post.time}</p>
          <p>{post.description}</p>
          <p>Contact ({post.contact_type}): {post.contact}</p>
          <p>Status: {post.status === 'pending' ? 'Not accepted yet' : 'Accepted'}</p>
          <p>Posted by: {post.username || 'Unknown'}</p>

          {/*if helper accept, show the rating and review*/}
          {post.helper && (
            <>
              <p style={{ fontSize: '0.85em', color: '#4CAF50' }}>
                Accepted by: {post.helper}
                {/* if helper has 'rating' */}
                {helperRatings[post.helper] ? (
                  <span style={{ marginLeft: '8px', color: '#555' }}>
                    ❤️ {helperRatings[post.helper].average} / 5 ({helperRatings[post.helper].count})
                  </span>
                ) : (
                //else
                <span style={{ marginLeft: '8px', color: '#999' }}>
                  No reviews yet
                </span>
              )}

              </p>
              {helperReviews[post.id] && (
                <div style={{ marginLeft: '10px', fontSize: '0.8em', color: '#444' }}>
                  <strong>📝Review:</strong>
                  <ul style={{ paddingLeft: '16px', marginTop: '4px' }}>
                   {helperReviews[post.id].map((r, idx) => (
                    <li key={idx}>❤️ {r.rating} – {r.comment || 'No comment'}</li>
                   ))}
                  </ul>
                </div>
              )}
            </>
          )}

          {/*accpet and cancel botton*/}
          <button className="pastel-button" onClick={() => handleStatusChange(post)} style={{ marginTop: '0.5rem' }}>
            {
              post.status === 'Accepted by helper'
                ? 'Cancel'
                : (post.username !== username ? 'Accept' : 'Waiting...')
            }
          </button>
          {/*poster can review*/}
          {post.username === username && post.status === 'Accepted by helper' && (
            <button className="pastel-button" onClick={() => {
                setSelectedPost(post);
                setShowReviewForm(true);
              }}
              style={{ marginTop:  '0.5rem', marginLeft: '8px' }}
            >
              Rate Helper
            </button>
          )}
        </div>
      ))}

      {/*seperate pages*/}
      {totalPages > 1 && (
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          style={{ margin: '0 6px' }}
        >
          Prev
        </button>
        {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            style={{
              margin: '0 4px',
              fontWeight: page === currentPage ? 'bold' : 'normal',
              backgroundColor: page === currentPage ? '#007bff' : '#f0f0f0',
              color: page === currentPage ? '#fff' : '#000',
              border: '1px solid #ccc',
              padding: '6px 12px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          style={{ margin: '0 6px' }}
        >Next</button>
      </div>
    )}


      {showReviewForm && selectedPost && (
        <ReviewForm
        requestId={selectedPost.id}
          helperId={selectedPost.helper}
          onClose={() => {
            setShowReviewForm(false);
            setSelectedPost(null);
          }}
        />
      )}
      </div>
    </div>
  );
}