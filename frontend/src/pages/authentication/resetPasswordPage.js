import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './authentication.css';

function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      return alert('Please fill out all fields.');
    }
    if (password !== confirmPassword) {
      return alert('Passwords do not match.');
    }

    try {
      setLoading(true);
      const res = await axios.post(
        `http://localhost:5000/api/auth/reset-password/${token}`,
        { password }
      );
      setMessage(res.data.message);
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Something went wrong. Please try again.';
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="authenticationContainer d-flex justify-content-center align-items-center">
      <form
        className="authenticationForm d-flex justify-content-center align-items-center flex-column"
        onSubmit={handleSubmit}
      >
        <img src="/logo.png" alt="Logo" />
        <h1>Reset Password</h1>

        <label>New Password</label>
        <input
          type="password"
          placeholder="Enter your new password"
          className="inputField"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        
        <label>Confirm Password</label>
        <input
          type="password"
          placeholder="Confirm your new password"
          className="inputField"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button type="submit" className="sign-in_btn" disabled={loading}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>

        {message && (
          <p
            className="text-center mt-3"
            style={{ color: message.includes('success') ? 'green' : 'red' }}
          >
            {message}
          </p>
        )}

        <div className="sign-in_footer mt-3">
          <p className="text-center fs-6">
            <a href="/" className="note">
              Back to Login
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}

export default ResetPasswordPage;
