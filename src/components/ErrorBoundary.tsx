import React from 'react';

interface State {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className='error-boundary'>
          <img src='/assets/sostek-logo.png' alt='SOSTEK' className='error-boundary__logo' />
          <h2 className='error-boundary__title'>Algo salió mal</h2>
          <p className='error-boundary__msg'>Ocurrió un error inesperado. Intenta recargar la página.</p>
          <button
            className='error-boundary__btn'
            onClick={() => { this.setState({ hasError: false }); window.location.replace('/'); }}
          >
            Reintentar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
