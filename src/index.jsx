import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
console.log('index.jsx executed');
import { ThemeProvider } from 'styled-components';
import theme from './theme';
import './style.css';
import { SessionProvider } from './context/SessionContext.jsx';

ReactDOM.createRoot(document.getElementById('app-container')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <SessionProvider>
        <App />
      </SessionProvider>
    </ThemeProvider>
  </React.StrictMode>,
)