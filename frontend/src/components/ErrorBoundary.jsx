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
        background: 'var(--bg-primary, #0A0A0F)',
        fontFamily: 'Outfit, sans-serif',
        gap: '1.5rem',
        textAlign: 'center',
      }}>
        {/* Glow */}
        <div style={{
          position: 'fixed', top: '30%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 500, height: 500, borderRadius: '50%', pointerEvents: 'none',
          background: 'radial-gradient(circle, rgba(239,68,68,0.06) 0%, transparent 70%)',
        }} />

        <div style={{ fontSize: '4rem', lineHeight: 1 }}>⚡</div>

        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary, #fff)', marginBottom: '0.5rem' }}>
            Something went wrong
          </h1>
          <p style={{ color: 'var(--text-muted, #888)', fontSize: '1rem', maxWidth: 480 }}>
            An unexpected error occurred while rendering this page. You can try reloading or go back to the home page.
          </p>
        </div>

        {/* Dev-only error details */}
        {isDev && this.state.error && (
          <div style={{
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: 12,
            padding: '1.25rem 1.5rem',
            maxWidth: 640,
            width: '100%',
            textAlign: 'left',
          }}>
            <p style={{ color: '#ef4444', fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              🛠 Development Error Details
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

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.75rem 2rem',
              borderRadius: 10,
              border: 'none',
              background: 'linear-gradient(135deg, var(--accent-blue, #00d4ff), var(--accent-amber, #f59e0b))',
              color: '#0A0A0F',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Reload Page
          </button>
          <button
            onClick={() => { this.handleReset(); window.location.href = '/'; }}
            style={{
              padding: '0.75rem 2rem',
              borderRadius: 10,
              border: '1px solid var(--border, #2a2a4a)',
              background: 'var(--bg-elevated, #111)',
              color: 'var(--text-primary, #fff)',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
