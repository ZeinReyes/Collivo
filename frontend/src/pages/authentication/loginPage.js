import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/authContext';
import { login as loginService } from '../../services/authService';
import axios from 'axios';
import './authentication.css';

function LoginPage() {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await loginService({ usernameOrEmail, password });
      const { user, token } = res.data;

      if (!user.isEmailVerified) {
        alert('Please verify your email before logging in.');
        navigate('/verify-email', { state: { email: user.email } });
        return;
      }

      login(user, token);

      if (user.role === 'Admin') navigate('/admin');
      else if (user.role === 'User') navigate('/project-management');
      else navigate('/home');
    } catch (err) {
      const resData = err.response?.data;
      const message = resData?.message || resData?.error || 'Login failed. Please try again.';
    
      alert(message);
    
      //Redirect to verify email page when not yet verified
      if (resData?.redirect === '/verify-email' && resData?.userId) {
        try {
          const userRes = await axios.get(`http://localhost:5000/api/users/${resData.userId}`);
          const email = userRes.data?.email;
    
          navigate('/verify-email', { state: { email } });
        } catch {
          navigate('/verify-email');
        }
      }
    }
  };

  return (
    <div className="authenticationContainer d-flex justify-content-center align-items-center">
      <form
        className="authenticationForm d-flex justify-content-center align-items-center flex-column"
        onSubmit={handleSubmit}
      >
        <img src="images/logo.png" alt="Logo" />
        <h1>Login</h1>

        <label>Email or Username</label>
        <input
          id="emailOrUsernameField"
          type="text"
          name="emailOrUsername"
          placeholder="Enter your email or username"
          className="inputField loginInput"
          value={usernameOrEmail}
          onChange={(e) => setUsernameOrEmail(e.target.value)}
        />

        <label>Password</label>
        <input
          id="password"
          type="password"
          name="password"
          placeholder="Enter your password"
          className="inputField loginInput"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <p className="forgotPassword">
          <a href="/forgot-password" className="note">
            Forgot Password?
          </a>
        </p>

        <button type="submit" className="sign-in_btn">
          Login
        </button>

        <div className="sign-in_footer">
          <p className="text-center fs-6">
            Don't have an account?{' '}
            <a href="/register" className="note">
              Register
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}

export default LoginPage;
