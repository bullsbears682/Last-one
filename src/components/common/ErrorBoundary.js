import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      errorId: Date.now().toString(36) + Math.random().toString(36).substr(2)
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Store error in localStorage for debugging (no external APIs)
    try {
      const errorLog = {
        timestamp: new Date().toISOString(),
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        },
        errorInfo: errorInfo,
        userAgent: navigator.userAgent,
        url: window.location.href,
        errorId: this.state.errorId
      };

      const existingLogs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
      existingLogs.push(errorLog);
      
      // Keep only last 10 errors
      const recentLogs = existingLogs.slice(-10);
      localStorage.setItem('errorLogs', JSON.stringify(recentLogs));
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });
  };

  handleGoHome = () => {
    this.handleReset();
    // If there's a way to navigate to home, do it
    if (this.props.onNavigateHome) {
      this.props.onNavigateHome();
    }
  };

  render() {
    if (this.state.hasError) {
      const isProduction = process.env.NODE_ENV === 'production';

      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          backgroundColor: 'var(--gray-50)',
          fontFamily: 'var(--font-family)'
        }}>
          <div style={{
            maxWidth: '500px',
            width: '100%',
            textAlign: 'center'
          }}>
            <div className="card">
              <div className="card-body">
                <div style={{
                  fontSize: '64px',
                  marginBottom: '20px',
                  color: 'var(--error)'
                }}>
                  <AlertTriangle size={64} style={{ margin: '0 auto' }} />
                </div>
                
                <h2 style={{
                  color: 'var(--error)',
                  marginBottom: '16px',
                  fontSize: 'var(--font-size-2xl)'
                }}>
                  Oops! Something went wrong
                </h2>
                
                <p style={{
                  color: 'var(--gray-600)',
                  marginBottom: '24px',
                  lineHeight: '1.6'
                }}>
                  We're sorry, but there was an unexpected error. This has been logged and we're working on a fix.
                </p>

                {!isProduction && this.state.error && (
                  <details style={{
                    marginBottom: '24px',
                    textAlign: 'left',
                    backgroundColor: 'var(--gray-100)',
                    padding: '16px',
                    borderRadius: 'var(--border-radius)',
                    fontSize: 'var(--font-size-sm)'
                  }}>
                    <summary style={{
                      cursor: 'pointer',
                      fontWeight: '600',
                      marginBottom: '8px'
                    }}>
                      Error Details (Development Mode)
                    </summary>
                    <pre style={{
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      fontSize: 'var(--font-size-xs)',
                      color: 'var(--gray-700)'
                    }}>
                      <strong>Error:</strong> {this.state.error.toString()}
                      {this.state.errorInfo.componentStack && (
                        <>
                          <br /><br />
                          <strong>Component Stack:</strong>
                          {this.state.errorInfo.componentStack}
                        </>
                      )}
                    </pre>
                  </details>
                )}

                <div style={{
                  display: 'flex',
                  gap: '12px',
                  justifyContent: 'center',
                  flexWrap: 'wrap'
                }}>
                  <button
                    onClick={this.handleReload}
                    className="btn btn-primary"
                    style={{ minWidth: '120px' }}
                  >
                    <RefreshCw size={16} />
                    Reload App
                  </button>
                  
                  <button
                    onClick={this.handleReset}
                    className="btn btn-secondary"
                    style={{ minWidth: '120px' }}
                  >
                    <Home size={16} />
                    Try Again
                  </button>
                </div>

                {this.state.errorId && (
                  <p style={{
                    marginTop: '20px',
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--gray-500)'
                  }}>
                    Error ID: {this.state.errorId}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;