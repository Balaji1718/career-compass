import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function NotFound() {
  const { user } = useAuth();

  return (
    <div className="state" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--c-primary)', lineHeight: 1 }}>
        404
      </div>
      <h1 style={{ margin: '12px 0 8px' }}>Page Not Found</h1>
      <p className="muted" style={{ maxWidth: 460, margin: '0 0 24px' }}>
        The page you are looking for does not exist or has been moved to a different location.
      </p>

      <div style={{ display: 'flex', gap: 12 }}>
        {user ? (
          <Link to="/dashboard" className="btn">
            Go to Dashboard
          </Link>
        ) : (
          <Link to="/" className="btn">
            Return to Home
          </Link>
        )}
        <Link to="/careers" className="btn secondary">
          Explore Careers
        </Link>
      </div>
    </div>
  );
}
