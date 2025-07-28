/**
 * Spinner.jsx
 * Reusable loading spinner component with accessibility support
 */

import React from 'react';
import './Spinner.css';

const Spinner = ({ 
  size = 'medium', 
  message = 'Loading...', 
  className = '',
  'aria-label': ariaLabel 
}) => {
  const sizeClasses = {
    small: 'spinner-small',
    medium: 'spinner-medium', 
    large: 'spinner-large'
  };

  return (
    <div 
      className={`spinner-container ${className}`}
      role="status"
      aria-live="polite"
      aria-label={ariaLabel || message}
    >
      <div className={`loading-spinner ${sizeClasses[size] || sizeClasses.medium}`}></div>
      {message && <p className="spinner-message">{message}</p>}
    </div>
  );
};

export default Spinner;