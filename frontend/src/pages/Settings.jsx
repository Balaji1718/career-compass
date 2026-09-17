import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { formatDate } from '../components/ui.jsx';

export default function Settings() {
  const { user, logout } = useAuth();

  return (
    <div className="stack">
      <div className="page-header">
        <h1>Account Settings</h1>
        <p>Manage your account credentials, view session details, and sign out.</p>
      </div>

      <section className="card">
        <h2>Account Profile</h2>
        <div className="grid cols-2" style={{ gap: 20 }}>
          <div>
            <p className="stat-label">Full Name</p>
            <p style={{ margin: '4px 0', fontSize: '1.1rem', fontWeight: 500 }}>
              {user ? user.name : '—'}
            </p>
          </div>
          <div>
            <p className="stat-label">Email Address</p>
            <p style={{ margin: '4px 0', fontSize: '1.1rem', fontWeight: 500 }}>
              {user ? user.email : '—'}
            </p>
          </div>
          <div>
            <p className="stat-label">Account Role</p>
            <p style={{ margin: '4px 0' }}>
              <span className="badge" style={{ textTransform: 'capitalize' }}>
                {user ? user.role : 'user'}
              </span>
            </p>
          </div>
          <div>
            <p className="stat-label">Account Status</p>
            <p style={{ margin: '4px 0' }}>
              <span className="badge strong">
                {user && user.isActive !== false ? 'Active' : 'Suspended'}
              </span>
            </p>
          </div>
          <div>
            <p className="stat-label">Member Since</p>
            <p className="small muted" style={{ margin: '4px 0' }}>
              {user && user.createdAt ? formatDate(user.createdAt) : '—'}
            </p>
          </div>
        </div>
      </section>

      <section className="card">
        <h2>Session Management</h2>
        <p className="small muted">
          Your session is secured via an HTTP-only, secure cookie with MongoDB TTL expiration.
          Click below to explicitly terminate your current authenticated session.
        </p>
        <div style={{ marginTop: 16 }}>
          <button
            type="button"
            className="btn"
            style={{ background: 'var(--c-danger)', borderColor: 'var(--c-danger)' }}
            onClick={logout}
          >
            Log Out of Account
          </button>
        </div>
      </section>
    </div>
  );
}
