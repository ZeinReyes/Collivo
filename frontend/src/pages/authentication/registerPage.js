import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './authentication.css';

function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: ''
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { fullName, username, email, password } = formData;

    if (!fullName || !username || !email || !password) {
      alert('All fields are required.');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', {
        fullName,
        username,
        email,
        password
      });

      alert(res.data.message || 'Registered successfully! Check your email for the verification code.');
      navigate('/verify-email', { state: { email } });
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Registration failed. Please try again.';
      alert(message);
    }
  };

  return (
    <div className="authenticationContainer d-flex justify-content-center align-items-center">
      <form
        className="authenticationForm d-flex justify-content-center align-items-center flex-column"
        onSubmit={handleSubmit}
      >
        <img
          src="images/logo.png"
          alt="Logo"
          style={{
            height: '60px',
            width: 'auto',
          }}
        />
        <h1>Register</h1>

        <label>Full Name</label>
        <input
          type="text"
          name="fullName"
          placeholder="Enter your full name"
          className="inputField registerInput"
          value={formData.fullName}
          onChange={handleChange}
        />

        <label>Username</label>
        <input
          type="text"
          name="username"
          placeholder="Enter your username"
          className="inputField registerInput"
          value={formData.username}
          onChange={handleChange}
        />

        <label>Email</label>
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          className="inputField registerInput"
          value={formData.email}
          onChange={handleChange}
        />

        <label>Password</label>
        <input
          type="password"
          name="password"
          placeholder="Enter your password"
          className="inputField registerInput"
          value={formData.password}
          onChange={handleChange}
        />

        <button type="submit" className="sign-in_btn">
          Register
        </button>

        <div className="sign-in_footer">
          <p className="text-center fs-6">
            Already have an account?{' '}
            <a href="/login" className="note">
              Login
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}

export default RegisterPage;
