import React from 'react';
import { LanguageContext } from '../i18n/LanguageContext';

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
      return (        <LanguageContext.Consumer>
          {({ t }) => (
            <div className='error-boundary'>
              <img src='/assets/sostek-logo.png' alt='SOSTEK' className='error-boundary__logo' />
              <h2 className='error-boundary__title'>{t('error.title')}</h2>
              <p className='error-boundary__msg'>{t('error.msg')}</p>
              <button
                className='error-boundary__btn'
                onClick={() => { this.setState({ hasError: false }); window.location.replace('/'); }}
              >
                {t('error.retry')}
              </button>
            </div>
          )}
        </LanguageContext.Consumer>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
