import React, { useState } from 'react';
import axios from 'axios';
import { setAuthentication } from '../../../components/auth/auth';
import './Login.css';

export const Login = (props) => {
  const [userData, setUserData] = useState({
    email: '',
    password: '',

  });

  const { email, password } = userData;

  const handleChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value
    });
  }

  console.log(password);

  const submitHandler = async (e) => {
    e.preventDefault();
    await axios.post('/api/users/login', { email, password }).then(res => {
      if (res.status === 200) {
        setAuthentication(res.data.user);
        props.history.push('/admin/chat');
        window.location.reload();
      }
      else {
        console.log(res.data.errorMessage);
      }
    })

  };


  return (

    <div>
          <>
            <div className='login'>
              <form onSubmit={submitHandler}>
                <div>
                  <input type='email' name='email' placeholder='Enter your email' onChange={handleChange} />
                </div>
                <div>
                  <input type='password' name='password' placeholder='Enter your password' onChange={handleChange} />
                </div>
                <button type="submit" class="registerbtn">Submit</button>
              </form>

            </div>
        </>
  </div>

  );
}
