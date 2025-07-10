import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import RequestForm from "./RequestForm";
import Login from "./login";
import Feed from "./feed";
import Profile from "./profile";

import { useEffect, useState } from "react";
import { supabase } from './supabaseClient';

function App() {
  //save the user info
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  //check if the user login
  useEffect(() => {
  const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
    setUser(session?.user || null); // Clear user on logout
    setChecking(false);             // Stop "loading" state
  });

  // Also check current user once on load
  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    setChecking(false);
  };

  getUser();

  return () => {
    authListener.subscription.unsubscribe(); // Cleanup
  };
}, []);


  if (checking) return <p>Loading...</p>; //avoid blank

   return (
    <Router>
      <Routes>
        {/* Login page */}
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/feed" />} />

        {/* Feed page */}
        <Route path="/feed" element={user ? <Feed /> : <Navigate to="/login" />} />

        {/* Request form */}
        <Route path="/request" element={user ? <RequestForm /> : <Navigate to="/login" />} />

        {/* Profile page */}
        <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />

        {/* Redirect any unknown path to login */}
        <Route path="*" element={<Navigate to={user ? "/feed" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;