import { useState } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';
import {
  MDBBtn,
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBInput,
} from 'mdb-react-ui-kit';
import 'mdb-react-ui-kit/dist/css/mdb.min.css';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setErrorMsg(error.message);
    } else {
      navigate('/feed');
    }
  };

  return (
    <MDBContainer className="my-5 gradient-form">
      <MDBRow>
        {/* Left column: login form */}
        <MDBCol md="6" lg="5" className="mb-5">
          <form onSubmit={handleLogin}>
            <h2 className="text-center mb-4">Login</h2>

            <MDBInput
              label="Email"
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              wrapperClass="mb-4"
            />

            <MDBInput
              label="Password"
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              wrapperClass="mb-4"
            />

            {errorMsg && <p className="text-danger">{errorMsg}</p>}

            <MDBBtn type="submit" className="w-100 mb-4" color="primary">
              Log In
            </MDBBtn>
          </form>
        </MDBCol>

        {/* Right column: mission statement + buttons */}
        <MDBCol md="6" lg="5" className="mb-5">
          <div className="d-flex flex-column justify-content-center gradient-custom h-100 mb-4 px-4 py-4 rounded shadow-3">
            <div className="text-dark mb-4">
              <h4 className="mb-4">We are more than just an app</h4>
              <p className="small mb-4">
                Welcome to our platform where we strive to provide engagement, connection, and support among our communities. Our team is dedicated to creating a space where you can thrive, contribute, and connect. Join us in building a community that values connection and service.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <MDBBtn color="primary" outline>Learn More</MDBBtn>
                <MDBBtn color="success" outline>Get Started</MDBBtn>
                <MDBBtn color="info" outline>Contact Us</MDBBtn>
              </div>
            </div>
          </div>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
}

export default Login;

