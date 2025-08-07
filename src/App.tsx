// Main App component for Clarity Canvas with Inner Garden UI
// Provides interface toggle between Canvas and Garden experiences

import React, { useState } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import Canvas from './components/Canvas';
import InnerGardenApp from './InnerGardenApp';
import { SessionProvider } from './context/SessionContext';
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

// Interface selection component
const InterfaceSelector = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  gap: 12px;
  
  button {
    padding: 12px 20px;
    border: 2px solid ${props => props.theme.colors.primary};
    border-radius: 8px;
    background: ${props => props.theme.colors.background};
    color: ${props => props.theme.colors.text};
    font-family: inherit;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      background: ${props => props.theme.colors.primary};
      color: ${props => props.theme.colors.background};
      transform: translateY(-2px);
    }
    
    &.active {
      background: ${props => props.theme.colors.primary};
      color: ${props => props.theme.colors.background};
    }
  }
`;

type InterfaceMode = 'canvas' | 'garden';

function App() {
  const [currentTheme, setCurrentTheme] = useState<'default' | 'highContrast'>('default');
  const [interfaceMode, setInterfaceMode] = useState<InterfaceMode>('canvas');

  const toggleTheme = () => {
    setCurrentTheme(currentTheme === 'default' ? 'highContrast' : 'default');
  };

  const switchToCanvas = () => {
    setInterfaceMode('canvas');
  };

  const switchToGarden = () => {
    setInterfaceMode('garden');
  };

  React.useEffect(() => {
    // App initialization
    console.log(`Clarity Canvas initialized - ${interfaceMode} mode`);
    
    // Set data-react-root on the HTML container to override CSS background
    const container = document.getElementById('app-container');
    if (container) {
      container.setAttribute('data-react-root', 'true');
    }
  }, [interfaceMode]);

  return (
    <ThemeProvider theme={(theme as any)[currentTheme] || (theme as any).default}>
      <SessionProvider>
        <AppContainer data-react-content="true">
          {/* Interface Selection */}
          {interfaceMode === 'canvas' && (
            <InterfaceSelector>
              <button onClick={toggleTheme}>
                {currentTheme === 'default' ? '🌙' : '☀️'} Theme
              </button>
              <button 
                onClick={switchToGarden}
                title="Switch to Inner Garden UI"
              >
                🌱 Garden Experience
              </button>
            </InterfaceSelector>
          )}

          {/* Render appropriate interface */}
          {interfaceMode === 'canvas' ? (
            <Canvas />
          ) : (
            <InnerGardenApp 
              onExitGarden={switchToCanvas}
              initialTheme={currentTheme}
            />
          )}
        </AppContainer>
      </SessionProvider>
    </ThemeProvider>
  );
}

export default App;