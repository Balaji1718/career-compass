import React from 'react';

/** Catches render crashes and offers recovery without exposing a stack trace. */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Developer-only detail; never rendered to the user.
    console.error('UI error boundary caught an error', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <main className="container page">
        <div className="card pad-lg state" role="alert">
          <h2>Something went wrong.</h2>
          <p>
            This part of the page could not be displayed. Your saved data has not
            been affected.
          </p>
          <div className="row" style={{ justifyContent: 'center' }}>
            <button
              type="button"
              className="btn"
              onClick={() => this.setState({ hasError: false })}
            >
              Try again
            </button>
            <button
              type="button"
              className="btn secondary"
              onClick={() => window.location.reload()}
            >
              Reload the page
            </button>
          </div>
        </div>
      </main>
    );
  }
}
