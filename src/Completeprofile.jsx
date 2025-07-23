import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import {
  MDBBtn,
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBInput
} from 'mdb-react-ui-kit';
import './App.css';

function CompleteProfile({ onComplete }) {
  const [formData, setFormData] = useState({
    phone: '',
    username: '',
    location: '',
    petType: '',
  });
  const [user, setUser] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        setErrorMsg("Failed to get current user");
      } else {
        setUser(data.user);
      }
    };
    fetchUser();
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setErrorMsg('');

    const { username, phone, location, petType } = formData;

    const { error } = await supabase.from('profile').insert([
      {
        id: user.id,
        "User name": username,
        phone: phone,
        location: location,
        "pet type": petType,
        "profile pic": '',
        email: user.email,
      },
    ]);

    if (error) {
      setErrorMsg(error.message);
    } else {
      onComplete && onComplete(user);
    }

    setLoading(false);
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

            <p>Please complete your profile</p>

            <form onSubmit={handleSubmit}>
              <MDBInput
                wrapperClass='mb-4'
                label='User Name'
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                required
              />
              <MDBInput
                wrapperClass='mb-4'
                label='Phone Number'
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
              />
              <MDBInput
                wrapperClass='mb-4'
                label='Location'
                name="location"
                type="text"
                value={formData.location}
                onChange={handleChange}
              />
              <MDBInput
                wrapperClass='mb-4'
                label='Pet Type (e.g., Dog, Cat)'
                name="petType"
                type="text"
                value={formData.petType}
                onChange={handleChange}
              />

              {errorMsg && <p className="text-danger">{errorMsg}</p>}

              <div className="text-center pt-1 mb-5 pb-1">
                <MDBBtn type="submit" className="mb-4 w-100 gradient-custom text-dark" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Profile'}
                </MDBBtn>
              </div>
            </form>
          </div>
        </MDBCol>

        <MDBCol col='6' className="mb-5">
          <div className="d-flex flex-column justify-content-center gradient-custom h-100 mb-4">
            <div className="description-block text-dark px-3 py-4 p-md-5 mx-md-4">
              <h4 className="mb-4">Just a few more steps</h4>
              <p className="description-text mb-0">
                Finish setting up your profile so we can connect you with the best features and experiences on pawPal. It only takes a minute!
              </p>
            </div>
          </div>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
}

export default CompleteProfile;
