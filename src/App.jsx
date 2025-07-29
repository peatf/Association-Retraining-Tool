// Main App component for Clarity Canvas
// Provides canvas container structure and global state management

import React, { useState } from 'react';
import styled, { ThemeProvider } from 'styled-components';

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

const CanvasContainer = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${props => props.theme.spacing.lg};
  min-height: calc(100vh - 80px);
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    padding: ${props => props.theme.spacing.md};
  }
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    padding: ${props => props.theme.spacing.sm};
  }
`;

const WelcomeCard = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xl};
  background: ${props => props.theme.colors.cardBackground};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.card};
  margin-bottom: ${props => props.theme.spacing.xl};
  
  h1 {
    color: ${props => props.theme.colors.primary};
    font-size: ${props => props.theme.typography.sizes['2xl']};
    margin-bottom: ${props => props.theme.spacing.md};
  }
  
  p {
    color: ${props => props.theme.colors.textSecondary};
    font-size: ${props => props.theme.typography.sizes.lg};
    max-width: 600px;
    margin: 0 auto;
  }
`;

const LanesGrid = styled.div`
  display: grid;
  gap: ${props => props.theme.spacing.xl};
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
    gap: ${props => props.theme.spacing.md};
  }
`;

const LaneCard = styled.section`
  background: ${props => props.theme.colors.cardBackground};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.card};
  overflow: hidden;
  
  &:hover {
    box-shadow: ${props => props.theme.shadows.cardHover};
  }
`;

const LaneHeader = styled.header`
  padding: ${props => props.theme.spacing.lg};
  border-bottom: 1px solid #eee;
  background: ${props => props.theme.colors.background};
  
  h2 {
    margin: 0;
    font-size: ${props => props.theme.typography.sizes.lg};
    font-weight: ${props => props.theme.typography.weights.semibold};
    color: ${props => props.theme.colors.primary};
  }
`;

const LaneContent = styled.div`
  padding: ${props => props.theme.spacing.lg};
  min-height: 200px;
  text-align: center;
  color: ${props => props.theme.colors.textSecondary};
`;

function App() {
  const [currentTheme, setCurrentTheme] = useState('default');

  const toggleTheme = () => {
    setCurrentTheme(currentTheme === 'default' ? 'highContrast' : 'default');
  };

  return (
    <ThemeProvider theme={theme[currentTheme]}>
      <AppContainer>
        <button onClick={toggleTheme}>Toggle Theme</button>
        <CanvasContainer>
          <WelcomeCard>
            <h1>Welcome to Clarity Canvas</h1>
            <p>
              A private, interactive space to work through challenging thoughts 
              and discover new perspectives through guided therapeutic exercises.
            </p>
          </WelcomeCard>

          <LanesGrid>
            <LaneCard>
              <LaneHeader>
                <h2>Readiness Assessment</h2>
              </LaneHeader>
              <LaneContent>
                Readiness Gate will be implemented in Phase 3
              </LaneContent>
            </LaneCard>

            <LaneCard>
              <LaneHeader>
                <h2>Thought Mining</h2>
              </LaneHeader>
              <LaneContent>
                Thought Mining cards will be implemented in Phase 4
              </LaneContent>
            </LaneCard>

            <LaneCard>
              <LaneHeader>
                <h2>Better-Feeling Thoughts</h2>
              </LaneHeader>
              <LaneContent>
                Hierarchical Thought Picker will be implemented in Phase 5
              </LaneContent>
            </LaneCard>
          </LanesGrid>
        </CanvasContainer>
      </AppContainer>
    </ThemeProvider>
  );
}

export default App;