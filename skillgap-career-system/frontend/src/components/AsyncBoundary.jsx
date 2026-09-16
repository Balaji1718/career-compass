import React from 'react';

export function LoadingState({ label = 'Loading…' }) {
  return (
    <div className="state" role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}

export function EmptyState({ title, message, action }) {
  return (
    <div className="state">
      <h3>{title}</h3>
      {message ? <p>{message}</p> : null}
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry, retryLabel = 'Try Again' }) {
  return (
    <div className="state" role="alert">
      <h3>We couldn&apos;t load this.</h3>
      <p>{message || 'Please try again in a moment.'}</p>
      {onRetry ? (
        <button type="button" className="btn" onClick={onRetry}>
          {retryLabel}
        </button>
      ) : null}
    </div>
  );
}

/**
 * Renders the right state for an async resource:
 * loading -> error (+retry) -> empty -> content.
 */
export default function AsyncBoundary({
  status,
  error,
  loadingLabel,
  isEmpty = false,
  empty,
  onRetry,
  children,
}) {
  if (status === 'idle') return null;
  if (status === 'loading') return <LoadingState label={loadingLabel} />;
  if (status === 'error') {
    return <ErrorState message={error && error.message} onRetry={onRetry} />;
  }
  if (isEmpty) {
    return empty || <EmptyState title="Nothing here yet." />;
  }
  return children;
}
