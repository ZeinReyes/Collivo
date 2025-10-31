import React, { useState } from 'react';
import axios from 'axios';
import './authentication.css';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return alert('Please enter your email.');

    try {
      setLoading(true);
      const res = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      setMessage(res.data.message);
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Something went wrong. Please try again.';
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
        <img src="images/logo.png" alt="Logo" />
        <h1>Forgot Password</h1>

        <p className="text-center note mb-3 text-decoration-none">
          Enter your email below and we’ll send you a password reset link.
        </p>

        <label>Email Address</label>
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          className="inputField"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button type="submit" className="sign-in_btn" disabled={loading}>
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>

        {message && (
          <p
            className="text-center mt-3"
            style={{ color: message.includes('sent') ? 'green' : 'red' }}
          >
            {message}
          </p>
        )}

        <div className="sign-in_footer mt-3">
          <p className="text-center fs-6">
            <a href="/login" className="note">
              Back to Login
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}

export default ForgotPasswordPage;
