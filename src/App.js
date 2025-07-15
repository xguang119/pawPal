import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

import Login from "./login";
import Feed from "./feed";
import PostRequest from "./PostRequest";
import Profile from "./profile";
import CompleteProfile from "./Completeprofile";
import LostAndFound from "./LostAndFound";
import LostFoundForm from './LostFoundForm';
import EditLostFoundForm from './EditLostFoundForm';
import MyLostFound from './MyLostFound';



function App() {
  const [user, setUser] = useState(null);
  const [profileExists, setProfileExists] = useState(null); // null = unknown
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const getSessionAndProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user || null;
      setUser(currentUser);

      if (currentUser) {
        const { data, error } = await supabase
          .from("profile")
          .select("*")
          .eq("id", currentUser.id)
          .single();

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching profile:", error.message);
        }

        setProfileExists(!!data && !error);
      } else {
        setProfileExists(false);
      }

      setChecking(false);
    };

    getSessionAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      getSessionAndProfile();
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  if (checking) return <p>Loading...</p>;

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            !user ? (
              <Login />
            ) : profileExists ? (
              <Navigate to="/feed" />
            ) : (
              <Navigate to="/complete-profile" />
            )
          }
        />

        <Route
          path="/complete-profile"
          element={
            user && !profileExists ? (
              <CompleteProfile onComplete={() => setProfileExists(true)} />
            ) : (
              <Navigate to="/feed" />
            )
          }
        />

        <Route
          path="/feed"
          element={
            user && profileExists ? (
              <Feed />
            ) : user ? (
              <Navigate to="/complete-profile" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/request"
          element={
            user && profileExists ? (
              <PostRequest />
            ) : user ? (
              <Navigate to="/complete-profile" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/profile"
          element={
            user && profileExists ? (
              <Profile />
            ) : user ? (
              <Navigate to="/complete-profile" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="*"
          element={
            <Navigate to={user ? (profileExists ? "/feed" : "/complete-profile") : "/login"} />
          }
        />

        <Route
          path="/lostfound"
          element={
            user && profileExists ? (
              <LostAndFound />
            ) : user ? (
              <Navigate to="/complete-profile" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/lostfoundform"
          element={
            user && profileExists ? (
              <LostFoundForm />
            ) : user ? (
              <Navigate to="/complete-profile" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/editlostfound/:id"
          element={
            user && profileExists ? (
              <EditLostFoundForm />
            ) : user ? (
              <Navigate to="/complete-profile" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/mylostfound"
          element={
            user && profileExists ? (
              <MyLostFound />
            ) : user ? (
              <Navigate to="/complete-profile" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />


      </Routes>
    </Router>
  );
}

export default App;
