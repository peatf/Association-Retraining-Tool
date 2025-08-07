// Inner Garden App - Main application component for the garden interface
// Integrates all garden components with existing therapeutic functionality

import React, { useState, useEffect } from 'react';
import { ThemeProvider } from 'styled-components';

import { GardenStateProvider } from './context/GardenStateContext';
import GardenErrorBoundary from './components/garden/GardenErrorBoundary';
import AssetPreloader from './components/garden/AssetPreloader';
import GardenRouter from './components/garden/GardenRouter';
import TransitionManager from './components/garden/TransitionManager';
import theme from './theme';
import './garden-global.css';

interface InnerGardenAppProps {
  onExitGarden?: () => void;
  initialTheme?: 'default' | 'highContrast';
}

const InnerGardenApp: React.FC<InnerGardenAppProps> = ({ 
  onExitGarden,
  initialTheme = 'default' 
}) => {
  const [currentTheme, setCurrentTheme] = useState<'default' | 'highContrast'>(initialTheme);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  // Handle asset loading completion
  const handleAssetsLoaded = () => {
    setAssetsLoaded(true);
    console.log('Garden assets loaded successfully');
  };

  // Handle loading progress updates
  const handleLoadingProgress = (progress: any) => {
    setLoadingProgress(progress.progress);
  };

  // Theme toggle (inherited from existing app)
  const toggleTheme = () => {
    setCurrentTheme(prev => prev === 'default' ? 'highContrast' : 'default');
  };

  // Debug panel toggle (development only)
  const toggleDebugInfo = () => {
    if (process.env.NODE_ENV === 'development') {
      setShowDebugInfo(prev => !prev);
    }
  };

  // Keyboard shortcuts for development
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Debug panel toggle with Ctrl+Shift+D
      if (e.ctrlKey && e.shiftKey && e.key === 'D' && process.env.NODE_ENV === 'development') {
        e.preventDefault();
        toggleDebugInfo();
      }
      
      // Theme toggle with Ctrl+Shift+T
      if (e.ctrlKey && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        toggleTheme();
      }
      
      // Exit garden with Escape (if handler provided)
      if (e.key === 'Escape' && onExitGarden) {
        e.preventDefault();
        onExitGarden();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onExitGarden]);

  // Backup garden state periodically
  useEffect(() => {
    const backupInterval = setInterval(() => {
      try {
        const gardenStateElement = document.querySelector('[data-garden-state]');
        if (gardenStateElement) {
          const state = gardenStateElement.getAttribute('data-garden-state');
          if (state) {
            localStorage.setItem('garden-session-backup', state);
          }
        }
      } catch (error) {
        console.warn('Failed to backup garden state:', error);
      }
    }, 30000); // Backup every 30 seconds

    return () => clearInterval(backupInterval);
  }, []);

  return (
    <ThemeProvider theme={(theme as any)[currentTheme] || (theme as any).default}>
      <GardenStateProvider>
          <GardenErrorBoundary 
            onError={(error, errorInfo) => {
              console.error('Garden error occurred:', { error, errorInfo });
            }}
          >
            <div 
              className="inner-garden-app garden-container"
              style={{
                fontFamily: 'var(--garden-font-family, inherit)',
                position: 'relative',
                width: '100vw',
                height: '100vh',
                overflow: 'hidden',
                background: 'var(--garden-night-primary)',
              }}
            >
              {/* Asset Preloader */}
              {!assetsLoaded && (
                <AssetPreloader
                  onLoadingComplete={handleAssetsLoaded}
                  onLoadingProgress={handleLoadingProgress}
                  showProgress={true}
                />
              )}

              {/* Main Garden Interface */}
              {assetsLoaded && (
                <TransitionManager>
                  <GardenRouter />
                </TransitionManager>
              )}

              {/* Development Debug Panel */}
              {showDebugInfo && process.env.NODE_ENV === 'development' && (
                <div
                  style={{
                    position: 'fixed',
                    top: '10px',
                    right: '10px',
                    background: 'rgba(0, 0, 0, 0.9)',
                    color: 'white',
                    padding: '12px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontFamily: 'monospace',
                    zIndex: 1000,
                    minWidth: '200px',
                    maxWidth: '300px',
                  }}
                >
                  <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>
                    Garden Debug Panel
                  </div>
                  <div>Theme: {currentTheme}</div>
                  <div>Assets Loaded: {assetsLoaded ? 'Yes' : `${loadingProgress}%`}</div>
                  <div>Environment: {process.env.NODE_ENV}</div>
                  <div style={{ marginTop: '8px', fontSize: '0.7rem', opacity: 0.7 }}>
                    Ctrl+Shift+D: Toggle this panel<br />
                    Ctrl+Shift+T: Toggle theme<br />
                    Escape: Exit garden
                  </div>
                </div>
              )}

              {/* Garden UI Controls */}
              <div
                style={{
                  position: 'fixed',
                  top: '20px',
                  left: '20px',
                  display: 'flex',
                  gap: '12px',
                  zIndex: 'var(--z-garden-controls)',
                }}
              >
                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="garden-button"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: 'var(--garden-moonlight)',
                    padding: '8px 12px',
                    borderRadius: 'var(--garden-radius-md)',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                  }}
                  title={`Switch to ${currentTheme === 'default' ? 'high contrast' : 'default'} theme`}
                >
                  {currentTheme === 'default' ? '🌙' : '☀️'}
                </button>

                {/* Exit Garden Button */}
                {onExitGarden && (
                  <button
                    onClick={onExitGarden}
                    className="garden-button"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: 'var(--garden-moonlight)',
                      padding: '8px 12px',
                      borderRadius: 'var(--garden-radius-md)',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                    }}
                    title="Return to Clarity Canvas"
                  >
                    🏠 Canvas
                  </button>
                )}
              </div>

              {/* Accessibility Skip Link */}
              <a
                href="#garden-main-content"
                style={{
                  position: 'absolute',
                  top: '-40px',
                  left: '8px',
                  background: 'var(--garden-moonlight)',
                  color: 'var(--garden-night-primary)',
                  padding: '8px 12px',
                  textDecoration: 'none',
                  borderRadius: 'var(--garden-radius-sm)',
                  zIndex: 'var(--z-garden-dialogs)',
                  transition: 'top var(--garden-transition-fast)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.top = '8px';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.top = '-40px';
                }}
              >
                Skip to garden content
              </a>

              {/* Main content landmark */}
              <div id="garden-main-content" style={{ display: 'contents' }} />
            </div>
          </GardenErrorBoundary>
        </GardenStateProvider>
    </ThemeProvider>
  );
};

export default InnerGardenApp;