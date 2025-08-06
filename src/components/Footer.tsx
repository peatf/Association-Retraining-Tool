// Footer component - Export controls and session management
// Provides copy/export functionality and session controls

import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useSession } from '../context/SessionContext.jsx';

const FooterContainer = styled.footer`
  background: ${props => props.theme.colors.cardBackground};
  border-top: 1px solid #eee;
  padding: ${props => props.theme.spacing.lg};
  margin-top: auto;
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    padding: ${props => props.theme.spacing.md};
  }
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${props => props.theme.spacing.lg};
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    flex-direction: column;
    gap: ${props => props.theme.spacing.md};
  }
`;

const ExportSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    flex-direction: column;
    gap: ${props => props.theme.spacing.sm};
  }
`;

const ExportButton = styled(motion.button)`
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.theme.typography.weights.regular};
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.primary}dd;
  }
  
  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary};
    outline-offset: 2px;
  }
  
  &:disabled {
    background: ${props => props.theme.colors.secondary};
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const SessionInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.sizes.sm};
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    flex-direction: column;
    gap: ${props => props.theme.spacing.sm};
    text-align: center;
  }
`;

const ClearButton = styled(motion.button)`
  background: none;
  border: 1px solid ${props => props.theme.colors.secondary};
  color: ${props => props.theme.colors.secondary};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: ${props => props.theme.typography.sizes.sm};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.colors.secondary};
    color: white;
  }
  
  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary};
    outline-offset: 2px;
  }
`;

const InsightCount = styled.span`
  background: ${props => props.theme.colors.primary}20;
  color: ${props => props.theme.colors.primary};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.theme.typography.weights.regular};
`;

function Footer() {
  const { canvasState, resetSession } = useSession();
  
  const hasInsights = canvasState.minedInsights && canvasState.minedInsights.length > 0;
  const insightCount = canvasState.minedInsights?.length || 0;

  const handleExport = () => {
    if (!hasInsights) return;
    
    try {
      // Create exportable data
      const exportData = {
        timestamp: new Date().toISOString(),
        insights: canvasState.minedInsights,
        journey: canvasState.userJourney,
        sessionSummary: {
          currentLane: canvasState.currentLane,
          isReady: canvasState.isReady,
          intensity: canvasState.intensity,
          selectedTopic: canvasState.selectedTopic
        }
      };
      
      // Create and download JSON file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `clarity-canvas-insights-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      console.log('Insights exported successfully');
    } catch (error) {
      console.error('Failed to export insights:', error);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!hasInsights) return;
    
    try {
      const insightText = canvasState.minedInsights
        .map((insight, index) => `${index + 1}. ${insight.text || insight}`)
        .join('\n\n');
      
      await navigator.clipboard.writeText(insightText);
      console.log('Insights copied to clipboard');
      
      // Could add a toast notification here in future
    } catch (error) {
      console.error('Failed to copy insights:', error);
    }
  };

  const handleClearSession = () => {
    if (window.confirm('Are you sure you want to clear your current session? This will remove all insights and progress.')) {
      resetSession();
    }
  };

  // Keyboard navigation handler
  const handleKeyDown = (event: React.KeyboardEvent, action: (...args: any[]) => void, ...args: any[]) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action(...args);
    }
  };

  return (
    <FooterContainer>
      <FooterContent>
        <ExportSection>
          <ExportButton
            onClick={handleCopyToClipboard}
            onKeyDown={(e) => handleKeyDown(e, handleCopyToClipboard)}
            disabled={!hasInsights}
            whileHover={{ scale: hasInsights ? 1.05 : 1 }}
            whileTap={{ scale: hasInsights ? 0.95 : 1 }}
            aria-label={`Copy ${insightCount} insights to clipboard`}
            data-testid="copy-insights-button"
          >
            📋 Copy Insights
          </ExportButton>
          
          <ExportButton
            onClick={handleExport}
            onKeyDown={(e) => handleKeyDown(e, handleExport)}
            disabled={!hasInsights}
            whileHover={{ scale: hasInsights ? 1.05 : 1 }}
            whileTap={{ scale: hasInsights ? 0.95 : 1 }}
            aria-label={`Export session with ${insightCount} insights`}
            data-testid="export-insights-button"
          >
            💾 Export Session
          </ExportButton>
        </ExportSection>
        
        <SessionInfo>
          {hasInsights && (
            <InsightCount data-testid="insight-count">
              {insightCount} insight{insightCount !== 1 ? 's' : ''} captured
            </InsightCount>
          )}
          
          <span>Session is ephemeral by default</span>
          
          <ClearButton
            onClick={handleClearSession}
            onKeyDown={(e) => handleKeyDown(e, handleClearSession)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Clear current session and all insights"
            data-testid="clear-session-button"
          >
            Clear Session
          </ClearButton>
        </SessionInfo>
      </FooterContent>
    </FooterContainer>
  );
}

export default Footer;