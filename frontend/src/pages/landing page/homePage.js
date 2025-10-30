import React from 'react';
import Navbar from '../../components/landing page/userNavbar';
import Footer from '../../components/landing page/userFooter';
import './homePage.css';

function HomePage() {
  return (
    <div>
      <Navbar />

      <main className="hero-section">
        <div className="hero-content">
          <h1>Collaboration that actually <span className='highlight'>flows.</span></h1>
          <p>
            Simplify teamwork with <span className='highlight'>Collivo</span> — where tasks, teams, and communication unite 
            into one powerful workspace.
          </p>
          <div className="hero-buttons">
            <button className="button btn">Get Started</button>
            <button className="button btn">Learn More</button>
          </div>
        </div>

        <div className="hero-images">
          <div className="card-box card-one"></div>
          <div className="card-box card-two"></div>
        </div>
      </main>

      <section className="features-section mb-5">
        <div className="features-header">
          <h2>Powerful tools for modern collaboration</h2>
          <p>
            Manage projects, chat in real time, and stay in sync — everything your team 
            needs to deliver work that matters.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon" style={{ backgroundColor: '#1e3a8a15' }}>
              <i className="bi bi-kanban" style={{ color: '#1e3a8a' }}></i>
            </div>
            <h4>Task Boards</h4>
            <p>Organize projects visually with drag-and-drop boards built for clarity and speed.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon" style={{ backgroundColor: '#1e3a8a15' }}>
              <i className="bi bi-chat-dots" style={{ color: '#1e3a8a' }}></i>
            </div>
            <h4>Real-Time Messaging</h4>
            <p>Stay connected with your team through instant messaging and live collaboration.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon" style={{ backgroundColor: '#1e3a8a15' }}>
              <i className="bi bi-people" style={{ color: '#1e3a8a' }}></i>
            </div>
            <h4>Smart Permissions</h4>
            <p>Control who can view, edit, and manage your projects — securely and easily.</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default HomePage;
