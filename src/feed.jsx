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
      <h1>Welcome to Your Feed</h1>
      <button style={{ margin: '1rem' }} onClick={() => navigate('/request')}>
        Go to Request Form
      </button>
      <button style={{ margin: '1rem' }} onClick={() => navigate('/profile')}>
        Go to Profile
      </button>
      <br />
      <button onClick={handleLogout} style={{ marginTop: '2rem', backgroundColor: '#f44336', color: 'white' }}>
        Logout
      </button>
    </div>
  );
}
