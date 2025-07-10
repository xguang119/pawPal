import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchPosts() {
      const { data, error } = await supabase
        .from("requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        console.error(error);
      } else {
        setPosts(data);
      }
    }
    fetchPosts();
  }, []);

  return (
    <div style={{ maxWidth: "650px", margin: "40px auto" }}>
      <h2>Recent Requests</h2>
      {posts.length === 0 && <p>No requests yet.</p>}
      {posts.map((post, index) => (
        <div
          key={post.id || index}
          style={{ border: "1px solid #ccc", padding: "12px", marginBottom: "12px" }}
        >
          {post.image_url && (
            <img src={post.image_url} alt="Request" style={{ width: "100%", marginBottom: "8px" }} />
          )}
          <p>
            <strong>{post.service}</strong> · {post.date} {post.time}
          </p>
          <p>{post.description}</p>
          <p>
            Contact ({post.contact_type}): {post.contact}
          </p>
          <p>Status: {post.status === "pending" ? "Not accepted yet" : "Accepted"}</p>
          <p>Posted by: {post.username || "Unknown"}</p>
        </div>
      ))}
      <button onClick={() => navigate("/request")} style={{ marginTop: "1rem" }}>
        Post a New Request
      </button>
      <button onClick={() => navigate("/profile")}>Go to Profile</button>
    </div>
  );
}
