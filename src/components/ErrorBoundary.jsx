import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '300px',
          padding: '2rem',
          textAlign: 'center',
          color: 'var(--text-secondary)',
        }}>
          <AlertTriangle size={48} style={{ color: 'var(--danger)', marginBottom: '1rem' }} />
          <h2 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            {this.props.title || 'Что-то пошло не так'}
          </h2>
          <p style={{ marginBottom: '1.5rem', maxWidth: '400px' }}>
            {this.props.message || 'Произошла ошибка. Попробуйте перезагрузить страницу.'}
          </p>
          <button
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            <RefreshCw size={16} /> Перезагрузить
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
