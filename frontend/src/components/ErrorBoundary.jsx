import React from 'react';

/**
 * Global React Error Boundary
 * Catches render-time JS crashes in any child component tree.
 * Shows a styled fallback instead of a blank/broken screen.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // In production you'd send this to Sentry / your logging service
    if (process.env.NODE_ENV === 'development') {
      console.error('[ErrorBoundary] Caught render error:', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const isDev = process.env.NODE_ENV === 'development';

    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        background: 'var(--bg-primary, #0B0B12)',
        fontFamily: 'Inter, sans-serif',
        gap: '1.5rem',
        textAlign: 'center',
      }}>
        <img src="/images/error-robot.png" alt="Error" style={{ width: 160, opacity: 0.85 }} />

        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'Outfit,sans-serif', color: 'var(--text-primary, #fff)', marginBottom: '0.5rem' }}>
            Something went wrong
          </h1>
          <p style={{ color: 'var(--text-muted, #888)', fontSize: '0.95rem', maxWidth: 440 }}>
            An unexpected error occurred. You can try reloading or go back to the home page.
          </p>
        </div>

        {/* Dev-only error details */}
        {isDev && this.state.error && (
          <div style={{
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: 12,
            padding: '1.25rem 1.5rem',
            maxWidth: 600,
            width: '100%',
            textAlign: 'left',
          }}>
            <p style={{ color: '#ef4444', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.85rem' }}>
              Development Error Details
            </p>
            <code style={{ fontSize: '0.8rem', color: '#fca5a5', whiteSpace: 'pre-wrap', wordBreak: 'break-word', display: 'block' }}>
              {this.state.error.toString()}
            </code>
            {this.state.errorInfo?.componentStack && (
              <details style={{ marginTop: '0.75rem' }}>
                <summary style={{ color: 'var(--text-muted, #888)', fontSize: '0.8rem', cursor: 'pointer' }}>
                  Component stack
                </summary>
                <code style={{ fontSize: '0.75rem', color: 'var(--text-muted, #888)', whiteSpace: 'pre-wrap', display: 'block', marginTop: '0.5rem' }}>
                  {this.state.errorInfo.componentStack}
                </code>
              </details>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Reload Page
          </button>
          <button className="btn btn-outline" onClick={() => { this.handleReset(); window.location.href = '/'; }}>
            Go to Home
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
