import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./login";
import Feed from "./feed";
import PostRequest from "./PostRequest";
import Profile from "./profile";
import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import 'mdb-react-ui-kit/dist/css/mdb.min.css';

function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setChecking(false);
    });

    // Check on mount
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setChecking(false);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  if (checking) return <p>Loading...</p>;

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/feed" />} />
        <Route path="/feed" element={user ? <Feed /> : <Navigate to="/login" />} />
        <Route path="/request" element={user ? <PostRequest /> : <Navigate to="/login" />} />
        <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to={user ? "/feed" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;
