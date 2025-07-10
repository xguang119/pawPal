import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import RequestForm from "./RequestForm";
import Login from "./login";
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
        {/*root path "/": If the user is logged in, display RequestForm*/}
        <Route path="/" element={user ? <RequestForm /> : <Navigate to="/login" />} />
        {/*login path "/login": If user is not logged in, display login page*/}
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;