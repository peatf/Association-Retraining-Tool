import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from 'styled-components';
import theme from './theme';
import './style.css';
import { SessionProvider } from './context/SessionContext';
import CanvasErrorBoundary from './components/CanvasErrorBoundary';
import * as Sentry from '@sentry/react';

// Initialize Sentry with npm package (disabled for now)
// Sentry.init({
//   dsn: process.env.VITE_SENTRY_DSN || 'https://examplePublicKey@o0.ingest.sentry.io/0',
//   tracesSampleRate: 1.0,
//   enabled: process.env.NODE_ENV === 'production',
// });

const container = document.getElementById('app-container');
if (container) {
  ReactDOM.createRoot(container).render(
    <React.StrictMode>
      <ThemeProvider theme={theme as any}>
        <SessionProvider>
          <CanvasErrorBoundary>
            <App />
          </CanvasErrorBoundary>
        </SessionProvider>
      </ThemeProvider>
    </React.StrictMode>,
  );
}