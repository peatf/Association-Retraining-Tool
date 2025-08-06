// Main App component for Clarity Canvas
// Provides canvas container structure and global state management

import React, { useState } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import Canvas from './components/Canvas';

import theme from './theme';

// Main app container with responsive design
const AppContainer = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.colors.background};
  font-family: ${props => props.theme.typography.fontFamily};
  color: ${props => props.theme.colors.text};
  line-height: 1.6;
  
  /* Ensure proper box-sizing */
  *, *::before, *::after {
    box-sizing: border-box;
  }
`;

function App() {
  const [currentTheme, setCurrentTheme] = useState<'default' | 'highContrast'>('default');

  const toggleTheme = () => {
    setCurrentTheme(currentTheme === 'default' ? 'highContrast' : 'default');
  };

  React.useEffect(() => {
    // Canvas initialization
    console.log('Clarity Canvas initialized');
  }, []);

  return (
    <ThemeProvider theme={theme[currentTheme] || theme.default}>
      <AppContainer>
        <button onClick={toggleTheme}>Toggle Theme</button>
        <Canvas />
      </AppContainer>
    </ThemeProvider>
  );
}

export default App;