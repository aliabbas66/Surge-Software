import React, { useState } from 'react';
import axios from 'axios';
import './Signup.css';
import { setAuthentication } from '../../../components/auth/auth';

export const Signup = () => {
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({
    fullName: '',
    email: '',
    phone: ''
  });

  const { fullName, email, phone } = userData;

  const handleChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value
    })
  }

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    await axios.post('/api/users/signup', { fullName, email, phone }).then(res => {
      setLoading(false);
      if (res.status === 200) {
        setAuthentication(res.data.user);
        document.location.reload();
      }
      else {
        console.log(res.data.errorMessage);
      }
    })
  };


  return (
    <div className='signup'>
      <form onSubmit={submitHandler}>
        <div>
          <input name='fullName' placeholder='Enter your full name' onChange={handleChange} />
        </div>
        <div>
          <input type='email' name='email' placeholder='Enter your email' onChange={handleChange} />
        </div>
        <div>
          <input type='text' name='phone' placeholder='Enter your phone' onChange={handleChange} />
        </div>
        <button type="submit" class="registerbtn">Submit</button>
      </form>

    </div>
  );
};
