import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useAction } from '../hooks/useAsync.js';
import { FieldErrors } from '../components/ui.jsx';

const EMPTY = { name: '', email: '', password: '', confirmPassword: '' };

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { pending, error, execute } = useAction();
  const [values, setValues] = useState(EMPTY);
  const [touched, setTouched] = useState(false);

  const issues = {
    name: values.name.trim().length < 2 ? 'Please enter your full name.' : null,
    email: !/\S+@\S+\.\S+/.test(values.email)
      ? 'Please enter a valid email address.'
      : null,
    password:
      values.password.length < 8
        ? 'Use at least 8 characters.'
        : !/[a-zA-Z]/.test(values.password) || !/[0-9]/.test(values.password)
          ? 'Include at least one letter and one number.'
          : null,
    confirmPassword:
      values.confirmPassword !== values.password ? 'Passwords do not match.' : null,
  };
  const valid = Object.values(issues).every((v) => v === null);

  function set(field) {
    return (event) => setValues({ ...values, [field]: event.target.value });
  }

  async function onSubmit(event) {
    event.preventDefault();
    setTouched(true);
    if (!valid) return;
    const result = await execute(() => register(values));
    if (result) navigate('/profile', { replace: true });
  }

  const fields = [
    { id: 'name', label: 'Full name', type: 'text', autoComplete: 'name' },
    { id: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
    {
      id: 'password',
      label: 'Password',
      type: 'password',
      autoComplete: 'new-password',
      hint: 'At least 8 characters, including a letter and a number.',
    },
    {
      id: 'confirmPassword',
      label: 'Confirm password',
      type: 'password',
      autoComplete: 'new-password',
    },
  ];

  return (
    <div style={{ maxWidth: 480, margin: '0 auto' }}>
      <div className="card pad-lg">
        <h1>Create your account</h1>
        <p className="muted small">
          You&apos;ll add your skills next, then get your first career match.
        </p>

        <FieldErrors error={error} />

        <form onSubmit={onSubmit} noValidate>
          {fields.map((field) => (
            <div className="field" key={field.id}>
              <label htmlFor={field.id}>{field.label}</label>
              <input
                id={field.id}
                name={field.id}
                type={field.type}
                autoComplete={field.autoComplete}
                required
                value={values[field.id]}
                aria-invalid={touched && Boolean(issues[field.id])}
                aria-describedby={
                  touched && issues[field.id] ? `${field.id}-error` : undefined
                }
                onChange={set(field.id)}
              />
              {field.hint ? <p className="hint">{field.hint}</p> : null}
              {touched && issues[field.id] ? (
                <p className="field-error" id={`${field.id}-error`}>
                  {issues[field.id]}
                </p>
              ) : null}
            </div>
          ))}

          <button type="submit" className="btn block" disabled={pending}>
            {pending ? 'Creating your account…' : 'Create account'}
          </button>
        </form>

        <p className="small muted mt-4" style={{ marginBottom: 0 }}>
          Already registered? <Link to="/login">Log in</Link>.
        </p>
      </div>
    </div>
  );
}
