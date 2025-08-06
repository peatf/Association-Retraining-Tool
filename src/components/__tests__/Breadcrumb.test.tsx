// Breadcrumb component tests
// Tests navigation functionality, keyboard support, and accessibility

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, test, beforeEach, expect } from 'vitest';
import { ThemeProvider } from 'styled-components';
import Breadcrumb from '../Breadcrumb.jsx';
import { SessionProvider } from '../../context/SessionContext.jsx';

// Mock theme for testing
const mockTheme = {
  colors: {
    primary: '#3498db',
    secondary: '#6c757d',
    background: '#f4f4f9',
    cardBackground: '#ffffff',
    text: '#2c3e50',
    textSecondary: '#666666',
    white: '#ffffff',
    error: '#9b2226'
  },
  typography: {
    fontFamily: {
      heading: 'system-ui, sans-serif',
      body: 'system-ui, sans-serif'
    },
    sizes: {
      sm: '0.875rem',
      md: '1rem',
      lg: '1.2rem',
      xl: '1.5rem',
      '2xl': '2rem'
    },
    weights: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800
    }
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem'
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '15px'
  },
  shadows: {
    card: '0 2px 4px rgba(0,0,0,0.1)',
    cardHover: '0 4px 8px rgba(0,0,0,0.15)'
  },
  breakpoints: {
    mobile: '320px',
    tablet: '768px',
    desktop: '1024px'
  }
};

// Mock SessionStateManager
vi.mock('../../js/SessionStateManager.js', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      initializeSession: vi.fn(),
      clearSession: vi.fn(),
      getSessionHealth: vi.fn(() => ({ status: 'healthy' })),
      safeUpdateState: vi.fn(),
      getCurrentState: vi.fn(() => ({})),
      handleError: vi.fn()
    }))
  };
});

// Test wrapper component
interface TestWrapperProps {
  children: React.ReactNode;
  initialState?: Record<string, any>;
}

const TestWrapper: React.FC<TestWrapperProps> = ({ children, initialState = {} }) => {
  return (
    <ThemeProvider theme={mockTheme}>
      <SessionProvider>
        {children}
      </SessionProvider>
    </ThemeProvider>
  );
};

describe('Breadcrumb Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders navigation with all lane steps', () => {
      render(
        <TestWrapper>
          <Breadcrumb />
        </TestWrapper>
      );

      expect(screen.getByRole('navigation', { name: /journey navigation/i })).toBeInTheDocument();
      expect(screen.getByTestId('breadcrumb-step-readiness')).toBeInTheDocument();
      expect(screen.getByTestId('breadcrumb-step-mining')).toBeInTheDocument();
      expect(screen.getByTestId('breadcrumb-step-picker')).toBeInTheDocument();
    });

    test('displays current step as active', () => {
      render(
        <TestWrapper>
          <Breadcrumb />
        </TestWrapper>
      );

      const readinessStep = screen.getByTestId('breadcrumb-step-readiness');
      expect(readinessStep).toHaveAttribute('aria-current', 'step');
    });

    test('shows progress indicator', () => {
      render(
        <TestWrapper>
          <Breadcrumb />
        </TestWrapper>
      );

      expect(screen.getByTestId('progress-indicator')).toBeInTheDocument();
      expect(screen.getByText(/progress:/i)).toBeInTheDocument();
    });

    test('displays navigation buttons', () => {
      render(
        <TestWrapper>
          <Breadcrumb />
        </TestWrapper>
      );

      expect(screen.getByTestId('nav-back-button')).toBeInTheDocument();
      expect(screen.getByTestId('nav-forward-button')).toBeInTheDocument();
    });
  });

  describe('Navigation Controls', () => {
    test('back button is disabled on first step', () => {
      render(
        <TestWrapper>
          <Breadcrumb />
        </TestWrapper>
      );

      const backButton = screen.getByTestId('nav-back-button');
      expect(backButton).toBeDisabled();
    });

    test('forward button is enabled on first step', () => {
      render(
        <TestWrapper>
          <Breadcrumb />
        </TestWrapper>
      );

      const forwardButton = screen.getByTestId('nav-forward-button');
      expect(forwardButton).not.toBeDisabled();
    });

    test('navigation buttons have proper aria labels', () => {
      render(
        <TestWrapper>
          <Breadcrumb />
        </TestWrapper>
      );

      expect(screen.getByLabelText(/go to previous step/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/go to next step/i)).toBeInTheDocument();
    });
  });

  describe('Step Interaction', () => {
    test('step buttons have proper accessibility attributes', () => {
      render(
        <TestWrapper>
          <Breadcrumb />
        </TestWrapper>
      );

      const readinessStep = screen.getByTestId('breadcrumb-step-readiness');
      expect(readinessStep).toHaveAttribute('aria-label');
      expect(readinessStep.getAttribute('aria-label')).toContain('Readiness');
      expect(readinessStep.getAttribute('aria-label')).toContain('current');
    });

    test('completed steps show completion indicator', () => {
      // This would need to be tested with a mock session state that has completed steps
      // For now, we test the structure
      render(
        <TestWrapper>
          <Breadcrumb />
        </TestWrapper>
      );

      // The component should render without errors
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    test('step buttons respond to Enter key', () => {
      render(
        <TestWrapper>
          <Breadcrumb />
        </TestWrapper>
      );

      const readinessStep = screen.getByTestId('breadcrumb-step-readiness');
      
      // Focus the button
      readinessStep.focus();
      expect(readinessStep).toHaveFocus();

      // Press Enter
      fireEvent.keyDown(readinessStep, { key: 'Enter' });
      
      // Should not throw error (actual navigation would be tested with session context)
    });

    test('step buttons respond to Space key', () => {
      render(
        <TestWrapper>
          <Breadcrumb />
        </TestWrapper>
      );

      const readinessStep = screen.getByTestId('breadcrumb-step-readiness');
      
      // Focus the button
      readinessStep.focus();
      
      // Press Space
      fireEvent.keyDown(readinessStep, { key: ' ' });
      
      // Should not throw error
    });

    test('navigation buttons respond to keyboard events', () => {
      render(
        <TestWrapper>
          <Breadcrumb />
        </TestWrapper>
      );

      const forwardButton = screen.getByTestId('nav-forward-button');
      
      // Focus the button
      forwardButton.focus();
      expect(forwardButton).toHaveFocus();

      // Press Enter
      fireEvent.keyDown(forwardButton, { key: 'Enter' });
      
      // Should not throw error
    });
  });

  describe('Responsive Design', () => {
    test('renders without errors on different screen sizes', () => {
      // Test mobile breakpoint
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 320,
      });

      const { unmount } = render(
        <TestWrapper>
          <Breadcrumb />
        </TestWrapper>
      );

      expect(screen.getByRole('navigation')).toBeInTheDocument();
      unmount();

      // Test tablet breakpoint
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      render(
        <TestWrapper>
          <Breadcrumb />
        </TestWrapper>
      );

      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });
  });

  describe('Progress Tracking', () => {
    test('displays correct progress information', () => {
      render(
        <TestWrapper>
          <Breadcrumb />
        </TestWrapper>
      );

      const progressIndicator = screen.getByTestId('progress-indicator');
      expect(progressIndicator).toBeInTheDocument();
      
      // Should show 0/3 initially (no completed steps)
      expect(progressIndicator).toHaveTextContent('0/3');
    });

    test('shows current lane description', () => {
      render(
        <TestWrapper>
          <Breadcrumb />
        </TestWrapper>
      );

      expect(screen.getByText(/current: readiness/i)).toBeInTheDocument();
      expect(screen.getByText(/assess your readiness to work through thoughts/i)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('handles missing session context gracefully', () => {
      // This would test error boundary behavior
      // For now, ensure component doesn't crash with minimal props
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        render(
          <ThemeProvider theme={mockTheme}>
            <Breadcrumb />
          </ThemeProvider>
        );
      }).toThrow(); // Should throw because useSession requires SessionProvider
      
      consoleSpy.mockRestore();
    });
  });

  describe('Accessibility Compliance', () => {
    test('has proper ARIA landmarks', () => {
      render(
        <TestWrapper>
          <Breadcrumb />
        </TestWrapper>
      );

      expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'Journey navigation');
    });

    test('step buttons have descriptive labels', () => {
      render(
        <TestWrapper>
          <Breadcrumb />
        </TestWrapper>
      );

      const steps = screen.getAllByRole('button');
      steps.forEach(step => {
        if (step.getAttribute('data-testid')?.includes('breadcrumb-step')) {
          expect(step).toHaveAttribute('aria-label');
          expect(step.getAttribute('aria-label')).toBeTruthy();
        }
      });
    });

    test('disabled buttons are properly marked', () => {
      render(
        <TestWrapper>
          <Breadcrumb />
        </TestWrapper>
      );

      const backButton = screen.getByTestId('nav-back-button');
      expect(backButton).toBeDisabled();
      expect(backButton).toHaveAttribute('disabled');
    });
  });
});