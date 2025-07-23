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

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg('Check your email to confirm registration!');
      // Optional: navigate('/login');
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
              <h4 className="logo-title mt-1 mb-5 pb-1">pawPal</h4>
            </div>

            <p>Create a new account</p>

            <form onSubmit={handleRegister}>
              <MDBInput
                wrapperClass='mb-4'
                label='Email address'
                id='registerEmail'
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <MDBInput
                wrapperClass='mb-4'
                label='Password'
                id='registerPassword'
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {errorMsg && <p className="text-danger">{errorMsg}</p>}
              {successMsg && <p className="text-success">{successMsg}</p>}

              <div className="text-center pt-1 mb-5 pb-1">
                <MDBBtn type="submit" className="mb-4 w-100 gradient-custom text-dark">
                  Sign Up
                </MDBBtn>
              </div>
            </form>

            <div className="d-flex flex-row align-items-center justify-content-center pb-4 mb-4">
              <p className="mb-0">Already have an account?</p>
              <MDBBtn outline className='mx-2' color='secondary' onClick={() => navigate('/login')}>
                Login
              </MDBBtn>
            </div>

          </div>
        </MDBCol>

        <MDBCol col='6' className="mb-5">
          <div className="d-flex flex-column justify-content-center gradient-custom h-100 mb-4">
            <div className="description-block text-dark px-3 py-4 p-md-5 mx-md-4">
              <h4 className="mb-4">Join our community</h4>
              <p className="description-text mb-0">
                We're more than just an app – we're a movement. Register now and be a part of our growing community of support, connection, and shared values.
              </p>
            </div>
          </div>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
}
