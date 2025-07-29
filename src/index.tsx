import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from 'styled-components';
import theme from './theme';
import './style.css';
import { SessionProvider } from './context/SessionContext';
Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  integrations: [new Sentry.BrowserTracing()],
  tracesSampleRate: 1.0,
});

import CanvasErrorBoundary from './components/CanvasErrorBoundary';

ReactDOM.createRoot(document.getElementById('app-container')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <SessionProvider>
        <CanvasErrorBoundary>
          <App />
        </CanvasErrorBoundary>
      </SessionProvider>
    </ThemeProvider>
  </React.StrictMode>,
)