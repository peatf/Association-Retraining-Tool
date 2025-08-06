// Breadcrumb component - Journey tracking and backtracking navigation
// Provides visual journey progress and navigation controls with keyboard support

import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useSession } from '../context/SessionContext';

interface LaneConfig {
  name: string;
  description: string;
  icon: string;
}

interface StepButtonProps {
  isActive: boolean;
  isCompleted: boolean;
  isClickable: boolean;
}

const BreadcrumbContainer = styled.nav`
  background: ${props => props.theme.colors.cardBackground};
  border-bottom: 1px solid #eee;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.lg};
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
    margin-bottom: ${props => props.theme.spacing.md};
  }
`;

const BreadcrumbContent = styled.div`
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

const JourneyPath = styled.ol`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  list-style: none;
  margin: 0;
  padding: 0;
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    flex-wrap: wrap;
    justify-content: center;
  }
`;

const JourneyStep = styled.li`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const StepButton = styled(motion.button)<StepButtonProps>`
  background: ${props => props.isActive ? props.theme.colors.primary : 'transparent'};
  color: ${props => props.isActive ? 'white' : props.isCompleted ? props.theme.colors.primary : props.theme.colors.textSecondary};
  border: 1px solid ${props => props.isActive ? props.theme.colors.primary : props.isCompleted ? props.theme.colors.primary : props.theme.colors.secondary};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.isActive ? props.theme.typography.weights.semibold : props.theme.typography.weights.regular};
  cursor: ${props => props.isClickable ? 'pointer' : 'default'};
  transition: all 0.2s ease;
  text-decoration: none;
  
  &:hover {
    ${props => props.isClickable && `
      background: ${props.isActive ? props.theme.colors.primary + 'dd' : props.theme.colors.primary + '10'};
      border-color: ${props.theme.colors.primary};
    `}
  }
  
  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary};
    outline-offset: 2px;
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    padding: ${props => props.theme.spacing.sm};
    font-size: ${props => props.theme.typography.sizes.sm};
  }
`;

const StepSeparator = styled.span`
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.sizes.sm};
  user-select: none;
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    display: none;
  }
`;

const NavigationControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    justify-content: center;
  }
`;

const NavButton = styled(motion.button)`
  background: ${props => props.theme.colors.secondary};
  color: white;
  border: none;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.theme.typography.weights.regular};
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  
  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.secondary}dd;
  }
  
  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary};
    outline-offset: 2px;
  }
  
  &:disabled {
    background: ${props => props.theme.colors.secondary}66;
    cursor: not-allowed;
  }
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    padding: ${props => props.theme.spacing.sm};
    font-size: ${props => props.theme.typography.sizes.sm};
  }
`;

const JourneyInfo = styled.div`
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

const ProgressIndicator = styled.div`
  background: ${props => props.theme.colors.secondary}33;
  border-radius: ${props => props.theme.borderRadius.sm};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.theme.typography.weights.regular};
  
  span {
    color: ${props => props.theme.colors.primary};
  }
`;

// Lane configuration with display names and navigation rules
const LANE_CONFIG: Record<string, LaneConfig> = {
  readiness: {
    name: 'Readiness',
    description: 'Assess your readiness to work through thoughts',
    icon: '🔍'
  },
  mining: {
    name: 'Thought Mining',
    description: 'Explore and identify challenging thoughts',
    icon: '⛏️'
  },
  picker: {
    name: 'Better Thoughts',
    description: 'Discover more helpful perspectives',
    icon: '💡'
  }
};

const LANE_ORDER = ['readiness', 'mining', 'picker'];

function Breadcrumb() {
  const { canvasState, navigateToLane, updateJourney } = useSession();
  const { currentLane, userJourney } = canvasState;

  // Get current lane index for navigation
  const currentIndex = LANE_ORDER.indexOf(currentLane);
  const canGoBack = currentIndex > 0;
  const canGoForward = currentIndex < LANE_ORDER.length - 1;

  // Calculate progress
  const completedSteps = userJourney.filter(step => step.completed).length;
  const totalSteps = LANE_ORDER.length;
  const progressPercentage = Math.round((completedSteps / totalSteps) * 100);

  const handleStepClick = (targetLane: string): void => {
    const targetIndex = LANE_ORDER.indexOf(targetLane);
    const currentIndex = LANE_ORDER.indexOf(currentLane);
    
    // Only allow navigation to completed steps or adjacent steps
    const isCompleted = userJourney.some(step => step.lane === targetLane && step.completed);
    const isAdjacent = Math.abs(targetIndex - currentIndex) <= 1;
    
    if (isCompleted || isAdjacent) {
      navigateToLane(targetLane);
    }
  };

  const handleBackNavigation = (): void => {
    if (canGoBack) {
      const previousLane = LANE_ORDER[currentIndex - 1];
      navigateToLane(previousLane);
    }
  };

  const handleForwardNavigation = (): void => {
    if (canGoForward) {
      const nextLane = LANE_ORDER[currentIndex + 1];
      navigateToLane(nextLane);
    }
  };

  // Keyboard navigation handler
  const handleKeyDown = (event: React.KeyboardEvent, action: (...args: any[]) => void, ...args: any[]): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action(...args);
    }
  };

  // Check if a step is clickable
  const isStepClickable = (lane: string): boolean => {
    const targetIndex = LANE_ORDER.indexOf(lane);
    const currentIndex = LANE_ORDER.indexOf(currentLane);
    const isCompleted = userJourney.some(step => step.lane === lane && step.completed);
    const isAdjacent = Math.abs(targetIndex - currentIndex) <= 1;
    
    return isCompleted || isAdjacent;
  };

  // Check if a step is completed
  const isStepCompleted = (lane: string): boolean => {
    return userJourney.some(step => step.lane === lane && step.completed);
  };

  return (
    <BreadcrumbContainer role="navigation" aria-label="Journey navigation">
      <BreadcrumbContent>
        <JourneyPath>
          {LANE_ORDER.map((lane, index) => {
            const config = LANE_CONFIG[lane];
            const isActive = lane === currentLane;
            const isCompleted = isStepCompleted(lane);
            const isClickable = isStepClickable(lane);
            
            return (
              <JourneyStep key={lane}>
                <StepButton
                  isActive={isActive}
                  isCompleted={isCompleted}
                  isClickable={isClickable}
                  onClick={() => isClickable && handleStepClick(lane)}
                  onKeyDown={(e) => isClickable && handleKeyDown(e, handleStepClick, lane)}
                  disabled={!isClickable}
                  whileHover={isClickable ? { scale: 1.05 } : {}}
                  whileTap={isClickable ? { scale: 0.95 } : {}}
                  aria-label={`${config.name}: ${config.description}${isActive ? ' (current)' : ''}${isCompleted ? ' (completed)' : ''}`}
                  aria-current={isActive ? 'step' : undefined}
                  data-testid={`breadcrumb-step-${lane}`}
                >
                  <span role="img" aria-hidden="true">{config.icon}</span>
                  <span>{config.name}</span>
                  {isCompleted && <span role="img" aria-label="completed">✓</span>}
                </StepButton>
                
                {index < LANE_ORDER.length - 1 && (
                  <StepSeparator aria-hidden="true">→</StepSeparator>
                )}
              </JourneyStep>
            );
          })}
        </JourneyPath>

        <NavigationControls>
          <NavButton
            onClick={handleBackNavigation}
            onKeyDown={(e) => handleKeyDown(e, handleBackNavigation)}
            disabled={!canGoBack}
            whileHover={canGoBack ? { scale: 1.05 } : {}}
            whileTap={canGoBack ? { scale: 0.95 } : {}}
            aria-label="Go to previous step"
            data-testid="nav-back-button"
          >
            <span>←</span>
            <span>Back</span>
          </NavButton>
          
          <NavButton
            onClick={handleForwardNavigation}
            onKeyDown={(e) => handleKeyDown(e, handleForwardNavigation)}
            disabled={!canGoForward}
            whileHover={canGoForward ? { scale: 1.05 } : {}}
            whileTap={canGoForward ? { scale: 0.95 } : {}}
            aria-label="Go to next step"
            data-testid="nav-forward-button"
          >
            <span>Next</span>
            <span>→</span>
          </NavButton>
        </NavigationControls>
      </BreadcrumbContent>
      
      <JourneyInfo>
        <ProgressIndicator data-testid="progress-indicator">
          Progress: <span>{completedSteps}/{totalSteps}</span> ({progressPercentage}%)
        </ProgressIndicator>
        
        <span>
          Current: {LANE_CONFIG[currentLane]?.name} - {LANE_CONFIG[currentLane]?.description}
        </span>
      </JourneyInfo>
    </BreadcrumbContainer>
  );
}

export default Breadcrumb;