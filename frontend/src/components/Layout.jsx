import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useOnline } from '../hooks/useAsync.js';

const AUTH_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/skills', label: 'Skills' },
  { to: '/careers', label: 'Careers' },
  { to: '/analysis', label: 'Analysis' },
  { to: '/recommendations', label: 'Recommendations' },
  { to: '/roadmap', label: 'Roadmap' },
  { to: '/history', label: 'History' },
];

export default function Layout({ children }) {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const online = useOnline();

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      {!online ? (
        <div className="offline-bar" role="status">
          You are offline. Pages already loaded still work; changes cannot be saved
          until you reconnect.
        </div>
      ) : null}

      <header className="site-header">
        <div className="container">
          <Link className="brand" to={isAuthenticated ? '/dashboard' : '/'}>
            <span className="brand-mark" aria-hidden="true">
              CC
            </span>
            Career Compass
          </Link>

          {isAuthenticated ? (
            <nav className="main-nav" aria-label="Main">
              {AUTH_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) => (isActive ? 'active' : undefined)}
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          ) : null}

          <div className="row">
            {isAuthenticated ? (
              <>
                <NavLink
                  to="/profile"
                  className="small muted"
                  style={{ textDecoration: 'none' }}
                >
                  {user.name}
                </NavLink>
                <NavLink to="/settings" className="btn secondary small">
                  Settings
                </NavLink>
                <button type="button" className="btn small" onClick={handleLogout}>
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn secondary small">
                  Log in
                </Link>
                <Link to="/register" className="btn small">
                  Create account
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main id="main" className="page">
        <div className="container">{children}</div>
      </main>

      <footer className="site-footer">
        <div className="container row between">
          <span>
            Career Compass — deterministic skill-gap analysis with optional AI
            explanations.
          </span>
          <span>Career and skill data: ESCO v1.2.1</span>
        </div>
      </footer>
    </div>
  );
}
