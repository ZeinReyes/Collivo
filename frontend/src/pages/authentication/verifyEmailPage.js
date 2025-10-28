import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './authentication.css';

function VerifyEmailPage() {
  const [code, setCode] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post('http://localhost:5000/api/auth/verify-email', {
        email,
        code
      });

      alert(res.data.message || 'Email verified successfully!');
      const { user, token } = res.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      if (user.role === 'Admin') navigate('/admin');
      else navigate('/home');
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Invalid or expired code. Please try again.';
      alert(message);
    }
  };

  return (
    <div className="authenticationContainer d-flex justify-content-center align-items-center">
      <form
        className="authenticationForm d-flex justify-content-center align-items-center flex-column"
        onSubmit={handleSubmit}
      >
        <img src="images/logo.png" alt="Logo" />
        <h1>Verify Email</h1>
        <p>Enter the 6-digit code sent to <b>{email}</b></p>

        <input
          type="text"
          maxLength="6"
          placeholder="Enter verification code"
          className="inputField verifyInput"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />

        <button type="submit" className="sign-in_btn">
          Verify
        </button>
      </form>
    </div>
  );
}

export default VerifyEmailPage;
