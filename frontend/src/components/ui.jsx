import React from 'react';

export const LEVEL_LABELS = {
  1: 'Beginner',
  2: 'Intermediate',
  3: 'Advanced',
  4: 'Expert',
};

export function bandClass(score) {
  if (score >= 80) return 'strong';
  if (score >= 60) return 'moderate';
  if (score >= 40) return 'partial';
  return 'low';
}

export function MatchBadge({ score, classification }) {
  return (
    <span className={`badge ${bandClass(score)}`}>
      {score}% · {classification}
    </span>
  );
}

export function ProgressBar({ value, label, variant }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label || 'Progress'}
      className={`bar ${variant || bandClass(pct)}`}
    >
      <span style={{ width: `${pct}%` }} />
    </div>
  );
}

export function LevelDots({ level, max = 4 }) {
  return (
    <span
      className="level-dots"
      aria-label={`Level ${level} of ${max}: ${LEVEL_LABELS[level] || 'not set'}`}
    >
      {Array.from({ length: max }).map((_, i) => (
        <i key={i} className={i < level ? 'on' : ''} aria-hidden="true" />
      ))}
    </span>
  );
}

export function Notice({ kind = 'info', children }) {
  return (
    <div className={`notice ${kind}`} role={kind === 'error' ? 'alert' : 'status'}>
      {children}
    </div>
  );
}

export function FieldErrors({ error }) {
  if (!error) return null;
  const details = error.details && error.details.length ? error.details : null;
  return (
    <div className="notice error" role="alert">
      <p style={{ margin: 0 }}>{error.message}</p>
      {details ? (
        <ul className="bullets" style={{ marginTop: 8 }}>
          {details.map((d, i) => (
            <li key={i}>
              {d.field}: {d.message}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function formatDate(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (_err) {
    return '—';
  }
}
