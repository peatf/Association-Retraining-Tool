// Main App component for Clarity Canvas
// Provides canvas container structure and global state management

import React from 'react';
import styled, { ThemeProvider } from 'styled-components';

// Design tokens and theme
const theme = {
  colors: {
    primary: '#3498db',
    secondary: '#6c757d',
    success: '#28a745',
    warning: '#ffc107',
    error: '#dc3545',
    background: '#f4f4f9',
    cardBackground: '#ffffff',
    cardShadow: 'rgba(0,0,0,0.1)',
    text: '#333333',
    textSecondary: '#666666'
  },
  
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    sizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem'
    },
    weights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    }
  },
  
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem'
  },
  
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px'
  },
  
  shadows: {
    card: '0 2px 4px rgba(0,0,0,0.1)',
    cardHover: '0 4px 8px rgba(0,0,0,0.15)',
    cardActive: '0 8px 16px rgba(0,0,0,0.2)'
  },

  breakpoints: {
    mobile: '320px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1440px'
  }
};

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

const LaneCard = styled.div`
  background: ${props => props.theme.colors.cardBackground};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.card};
  overflow: hidden;
  
  &:hover {
    box-shadow: ${props => props.theme.shadows.cardHover};
  }
`;

const LaneHeader = styled.div`
  padding: ${props => props.theme.spacing.lg};
  border-bottom: 1px solid #eee;
  background: #f8f9fa;
  
  h3 {
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
  return (
    <ThemeProvider theme={theme}>
      <AppContainer>
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
                <h3>Readiness Assessment</h3>
              </LaneHeader>
              <LaneContent>
                Readiness Gate will be implemented in Phase 3
              </LaneContent>
            </LaneCard>

            <LaneCard>
              <LaneHeader>
                <h3>Thought Mining</h3>
              </LaneHeader>
              <LaneContent>
                Thought Mining cards will be implemented in Phase 4
              </LaneContent>
            </LaneCard>

            <LaneCard>
              <LaneHeader>
                <h3>Better-Feeling Thoughts</h3>
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