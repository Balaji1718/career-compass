import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useAction } from '../hooks/useAsync.js';
import { FieldErrors } from '../components/ui.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { pending, error, execute } = useAction();
  const [values, setValues] = useState({ email: '', password: '' });
  const [touched, setTouched] = useState(false);

  const emailValid = /\S+@\S+\.\S+/.test(values.email);
  const passwordValid = values.password.length > 0;

  async function onSubmit(event) {
    event.preventDefault();
    setTouched(true);
    if (!emailValid || !passwordValid) return;
    const result = await execute(() => login(values));
    if (result) {
      const target = (location.state && location.state.from) || '/dashboard';
      navigate(target, { replace: true });
    }
  }

  return (
    <div style={{ maxWidth: 440, margin: '0 auto' }}>
      <div className="card pad-lg">
        <h1>Log in</h1>
        <p className="muted small">
          Your session stays active after a refresh or a browser restart.
        </p>

        <FieldErrors error={error} />

        <form onSubmit={onSubmit} noValidate>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={values.email}
              aria-invalid={touched && !emailValid}
              aria-describedby={touched && !emailValid ? 'email-error' : undefined}
              onChange={(e) => setValues({ ...values, email: e.target.value })}
            />
            {touched && !emailValid ? (
              <p className="field-error" id="email-error">
                Please enter a valid email address.
              </p>
            ) : null}
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={values.password}
              aria-invalid={touched && !passwordValid}
              onChange={(e) => setValues({ ...values, password: e.target.value })}
            />
            {touched && !passwordValid ? (
              <p className="field-error">Please enter your password.</p>
            ) : null}
          </div>

          <button type="submit" className="btn block" disabled={pending}>
            {pending ? 'Signing you in…' : 'Log in'}
          </button>
        </form>

        <p className="small muted mt-4" style={{ marginBottom: 0 }}>
          No account yet? <Link to="/register">Create one</Link>.
        </p>
      </div>
    </div>
  );
}
