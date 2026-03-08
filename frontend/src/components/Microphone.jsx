import React from 'react';
import './Microphone.css';

/**
 * Microphone component - Button with status indicator for voice recording
 * 
 * @param {Object} props
 * @param {boolean} props.isActive - Recording state
 * @param {boolean} props.isConnecting - Connection state
 * @param {Function} props.onStart - Start callback
 * @param {Function} props.onStop - Stop callback
 * @param {boolean} props.disabled - Button disabled state
 */
const Microphone = ({ isActive, isConnecting, onStart, onStop, disabled }) => {
  // Determine button text based on state
  const getButtonText = () => {
    if (isConnecting) return 'Connecting...';
    if (isActive) return 'Stop';
    return 'Start';
  };

  // Determine button class based on state
  const getButtonClass = () => {
    let classes = 'microphone-button';
    
    if (disabled) {
      classes += ' microphone-button--disabled';
    } else if (isActive) {
      classes += ' microphone-button--active';
    } else if (isConnecting) {
      classes += ' microphone-button--connecting';
    } else {
      classes += ' microphone-button--idle';
    }
    
    return classes;
  };

  // Determine status indicator class
  const getIndicatorClass = () => {
    let classes = 'microphone-indicator';
    
    if (isActive) {
      classes += ' microphone-indicator--active';
    } else if (isConnecting) {
      classes += ' microphone-indicator--connecting';
    }
    
    return classes;
  };

  // Handle button click
  const handleClick = () => {
    if (disabled) return;
    
    if (isActive) {
      onStop();
    } else if (!isConnecting) {
      onStart();
    }
  };

  return (
    <div className="microphone-container">
      <button
        className={getButtonClass()}
        onClick={handleClick}
        disabled={disabled}
        aria-label={getButtonText()}
      >
        <span className={getIndicatorClass()} aria-hidden="true" />
        <span className="microphone-button-text">{getButtonText()}</span>
      </button>
    </div>
  );
};

export default Microphone;
