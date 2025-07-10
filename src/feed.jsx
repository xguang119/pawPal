import { useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";

export default function Feed() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: 'auto', textAlign: 'center' }}>
      <h1>Temp Feed</h1>
      <button style={{ margin: '1rem' }} onClick={() => navigate('/request')}>
        Add Post
      </button>
      <button style={{ margin: '1rem' }} onClick={() => navigate('/profile')}>
        Profile
      </button>
      <br />
    </div>
  );
}
