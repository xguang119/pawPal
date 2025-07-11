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
      <MDBRow className="justify-content-center">
        <MDBCol md="6" lg="4">
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
      </MDBRow>
    </MDBContainer>
  );
}

export default Login;

