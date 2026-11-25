import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { LanguageProvider, prepareLanguage } from './i18n/LanguageContext';

const container = document.getElementById('root');
const root = createRoot(container!);
prepareLanguage().finally(() => root.render(
  <React.StrictMode>
    <LanguageProvider>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </LanguageProvider>
  </React.StrictMode>
));
