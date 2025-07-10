import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import RequestForm from "./RequestForm";
import Login from "./login";
import Feed from "./Feed";
import Profile from "./Profile";

import { useEffect, useState } from "react";
import { supabase } from './supabaseClient';

function App() {
  //save the user info
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  //check if the user login
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();//get the current user
      setUser(user);//If there is a logged in user, then save
      setChecking(false);
    };
    checkUser();
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