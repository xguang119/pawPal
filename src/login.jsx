
import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';
import {
  MDBBtn,
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBInput
} from 'mdb-react-ui-kit';
import './App.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setErrorMsg(error.message);
    } else {
      // Login successful — navigate will redirect based on App.jsx logic
      navigate('/feed');
    }
  };

  return (

    <MDBContainer className="my-5 gradient-form">
      <MDBRow>
        <MDBCol col='6' className="mb-5">
          <div className="d-flex flex-column ms-5">

            <div className="text-center">
              <img
                src="PastelLogo.png"
                style={{ width: '385px' }}
                alt="logo"
              />
              <h4 className="logo-title mt-1 mb-5 pb-1-1 mb-5 pb-1">pawPal</h4>
            </div>

            <p>Please login to your account</p>

            <form onSubmit={handleLogin}>
              <MDBInput
                wrapperClass='mb-4'
                label='Email address'
                id='form1'
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <MDBInput
                wrapperClass='mb-4'
                label='Password'
                id='form2'
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {errorMsg && <p className="text-danger">{errorMsg}</p>}

              <div className="text-center pt-1 mb-5 pb-1">
                <MDBBtn type="submit" className="mb-4 w-100 gradient-custom text-dark">
                  Sign in
                </MDBBtn>
                <a className="text-muted" href="#!">Forgot password?</a>
              </div>
            </form>

            <div className="d-flex flex-row align-items-center justify-content-center pb-4 mb-4">
              <p className="mb-0">Don't have an account?</p>
              <MDBBtn outline className='mx-2' color='secondary'>
                Register
              </MDBBtn>
            </div>

          </div>
        </MDBCol>

        <MDBCol col='6' className="mb-5">
          <div className="d-flex flex-column justify-content-center gradient-custom h-100 mb-4">
            <div className="description-block text-dark px-3 py-4 p-md-5 mx-md-4">
              <h4 className="mb-4">We are more than just an app</h4>
              <p className="description-text mb-0">
                Welcome to our platform where we strive to provide engagement, connection, and support among our communities. Our team is dedicated to creating a space where you can thrive, contribute, and connect. Join us in building a community that values connection and service.
              </p>
            </div>
          </div>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
}

