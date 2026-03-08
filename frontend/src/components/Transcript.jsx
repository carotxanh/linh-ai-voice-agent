import { useEffect, useRef } from 'react';
import './Transcript.css';

/**
 * Transcript component - Display live and historical transcripts
 * 
 * @param {Object} props
 * @param {string} props.partialTranscript - Current live text
 * @param {string[]} props.committedHistory - Past transcripts
 * @param {boolean} props.isActive - Recording state
 * @param {Function} props.onClearHistory - Clear callback
 */
const Transcript = ({ partialTranscript, committedHistory, isActive, onClearHistory }) => {
  const historyEndRef = useRef(null);

  // Auto-scroll to bottom when new content is added
  useEffect(() => {
    if (historyEndRef.current && historyEndRef.current.scrollIntoView) {
      historyEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [committedHistory, partialTranscript]);

  // Show placeholder when no transcript and not active
  const showPlaceholder = !partialTranscript && committedHistory.length === 0;

  return (
    <div className="transcript-container">
      {/* Live Transcript Section */}
      <div className="transcript-live-section">
        <h3 className="transcript-section-title">Live Transcript</h3>
        <div className="transcript-live-content">
          {showPlaceholder ? (
            <span className="transcript-placeholder">Listening...</span>
          ) : (
            <span className="transcript-live-text">{partialTranscript || '\u00A0'}</span>
          )}
        </div>
      </div>

      {/* History Section */}
      <div className="transcript-history-section">
        <div className="transcript-history-header">
          <h3 className="transcript-section-title">History</h3>
          {committedHistory.length > 0 && (
            <button
              className="transcript-clear-button"
              onClick={onClearHistory}
              aria-label="Clear history"
            >
              Clear History
            </button>
          )}
        </div>
        <div className="transcript-history-list">
          {committedHistory.length === 0 ? (
            <div className="transcript-history-empty">No history yet</div>
          ) : (
            <>
              {committedHistory.map((text, index) => (
                <div key={index} className="transcript-history-item">
                  {text}
                </div>
              ))}
              <div ref={historyEndRef} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Transcript;
