import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './userNavbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow fixed-top">
      <div className="container d-flex justify-content-between align-items-center">

        <span
          className="navbar-brand fw-bold fs-3"
          style={{ cursor: 'pointer', color: '#1e3a8a' }}
          onClick={() => navigate('/')}
        >
          Collivo.
        </span>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0 gap-5 text-center text-lg-start">
            <li className="nav-item">
              <span
                className={`nav-link ${
                  location.pathname === '/home' ? 'active-link' : 'text-primary'
                }`}
                onClick={() => navigate('/home')}
                style={{ cursor: 'pointer' }}
              >
                Home
              </span>
            </li>
            <li className="nav-item">
              <span
                className={`nav-link ${
                  location.pathname === '/about' ? 'active-link' : 'text-primary'
                }`}
                onClick={() => navigate('/about')}
                style={{ cursor: 'pointer' }}
              >
                About
              </span>
            </li>
            <li className="nav-item">
              <span
                className={`nav-link ${
                  location.pathname === '/contact' ? 'active-link' : 'text-primary'
                }`}
                onClick={() => navigate('/contact')}
                style={{ cursor: 'pointer' }}
              >
                Contact Us
              </span>
            </li>
          </ul>

          <div className="d-flex flex-lg-row gap-2 align-items-center">
            <button
              className="btn"
              style={{  color: '#1e3a8a', border: '1px solid #1e3a8a' }}
              onClick={() => navigate('/login')}
            >
              Sign In
            </button>
            <button
              className="btn btn-primary"
              style={{  color: '#fff', background: '#1e3a8a', border: 'none' }}
              onClick={() => navigate('/register')}
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
