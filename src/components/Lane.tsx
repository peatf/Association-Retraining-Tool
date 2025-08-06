// Lane component - Container for organizing cards within canvas lanes
// Provides consistent styling and responsive behavior for card groups

import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

interface LaneContainerProps {
  $isActive?: boolean;
}

interface LaneHeaderProps {
  $isActive?: boolean;
}

interface LaneProps {
  id: string;
  title: string;
  children: React.ReactNode;
  isActive?: boolean;
  className?: string;
}

const LaneContainer = styled(motion.div)<LaneContainerProps>`
  background: ${props => props.theme.colors.cardBackground};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.card};
  overflow: hidden;
  transition: box-shadow 0.3s ease;
  
  ${props => props.$isActive && `
    box-shadow: ${props.theme.shadows.cardHover};
    border: 2px solid ${props.theme.colors.primary};
  `}
  
  &:hover {
    box-shadow: ${props => props.theme.shadows.cardHover};
  }
`;

const LaneHeader = styled.div<LaneHeaderProps>`
  padding: ${props => props.theme.spacing.lg};
  border-bottom: 1px solid #eee;
  background: ${props => props.$isActive ? props.theme.colors.primary : '#f8f9fa'};
  color: ${props => props.$isActive ? 'white' : props.theme.colors.text};
  
  h3 {
    margin: 0;
    font-size: ${props => props.theme.typography.sizes.lg};
    font-weight: ${props => props.theme.typography.weights.semibold};
  }
`;

const LaneContent = styled.div`
  padding: ${props => props.theme.spacing.lg};
  min-height: 200px;
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    padding: ${props => props.theme.spacing.md};
    min-height: 150px;
  }
`;

const laneVariants = {
  inactive: {
    opacity: 0.7,
    scale: 0.98
  },
  active: {
    opacity: 1,
    scale: 1
  }
};

const Lane: React.FC<LaneProps> = ({ 
  id, 
  title, 
  children, 
  isActive = false, 
  className = '', 
  ...props 
}) => {
  return (
    <LaneContainer
      className={className}
      $isActive={isActive}
      variants={laneVariants}
      animate={isActive ? 'active' : 'inactive'}
      transition={{ duration: 0.3 }}
      data-testid={id}
      role="region"
      aria-label={title}
      {...props}
    >
      <LaneHeader $isActive={isActive}>
        <h3>{title}</h3>
      </LaneHeader>
      
      <LaneContent>
        {children}
      </LaneContent>
    </LaneContainer>
  );
};

export default Lane;