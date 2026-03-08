import { useState, useCallback } from 'react';
import { useScribe, CommitStrategy } from '../hooks/useScribe';
import { LiveWaveform } from '../components/LiveWaveform';
import './RealtimeTranscription.css';

/**
 * Realtime Transcription Page
 * Migrated from Next.js example - connects to Backend instead of ElevenLabs directly
 * 
 * KEY CHANGES FROM ORIGINAL:
 * 1. Uses custom useScribe hook that connects to Backend (ws://localhost:8000)
 * 2. No API key in frontend - Backend handles ElevenLabs authentication
 * 3. No token fetching needed - Backend manages tokens
 */
export default function RealtimeTranscription() {
  const [error, setError] = useState(null);
  const [partialTranscript, setPartialTranscript] = useState('');
  const [committedHistory, setCommittedHistory] = useState([]);

  // Get backend URL from environment or use default
  const backendUrl = import.meta.env.VITE_BACKEND_WS_URL || 'ws://localhost:8000/ws/audio-stream';

  // Initialize useScribe hook with Backend connection
  const scribe = useScribe({
    modelId: 'scribe_v2_realtime',
    commitStrategy: CommitStrategy.VAD,
    vadSilenceThresholdSecs: 0.8, // Reduced from 1.5s for faster response
    vadThreshold: 0.01, // Lowered from 0.4 for better sensitivity
    backendUrl, // CRITICAL: Connect to Backend, not ElevenLabs
    onPartialTranscript: data => {
      console.log('🎤 onPartialTranscript called:', data);
      setPartialTranscript(data.text || '');
    },
    onCommittedTranscript: data => {
      console.log('✅ onCommittedTranscript called:', data);
      if (data.text && data.text.trim()) {
        setCommittedHistory(prev => [data.text, ...prev]);
      }
      setPartialTranscript('');
    },
    onError: err => {
      console.error('Scribe error:', err);
      setError('Connection error occurred. Please try again.');
    },
  });

  // Check both connected and transcribing states
  const isActive = scribe.status === 'connected' || scribe.status === 'transcribing';
  const isConnecting = scribe.status === 'connecting';

  /**
   * Start transcription
   * SIMPLIFIED: No token fetching needed - Backend handles authentication
   */
  const handleStart = useCallback(async () => {
    try {
      setError(null);
      setPartialTranscript('');

      // Connect with microphone access
      // Backend will handle ElevenLabs authentication
      await scribe.connect({
        microphone: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
    } catch (err) {
      console.error('Failed to start transcription:', err);
      setError('Failed to start transcription. Please check your permissions and try again.');
    }
  }, [scribe]);

  /**
   * Stop transcription
   */
  const handleStop = useCallback(() => {
    scribe.disconnect();
    setPartialTranscript('');
  }, [scribe]);

  /**
   * Toggle transcription on/off
   */
  const handleToggle = () => {
    if (isActive) {
      handleStop();
    } else {
      handleStart();
    }
  };

  /**
   * Clear transcript history
   */
  const handleClearHistory = () => {
    setCommittedHistory([]);
  };

  return (
    <main className="realtime-transcription">
      <div className="container">
        <header className="header">
          <h1 className="title">Realtime Transcription</h1>
          <p className="subtitle">Live speech-to-text via Backend (secure)</p>
        </header>

        <div className="content">
          {/* Controls */}
          <div className="controls">
            <div className="controls-left">
              <button
                onClick={handleToggle}
                disabled={isConnecting}
                className={`btn btn-${isActive ? 'stop' : isConnecting ? 'disabled' : 'start'}`}
              >
                {isConnecting ? 'Connecting...' : isActive ? 'Stop' : 'Start'}
              </button>
              {committedHistory.length > 0 && (
                <button onClick={handleClearHistory} className="btn btn-clear">
                  Clear History
                </button>
              )}
            </div>
            <div className="status">
              {isActive ? (
                <span className="status-active">
                  <span className="status-dot"></span>
                  {scribe.status === 'transcribing' ? 'Transcribing' : 'Connected'}
                </span>
              ) : (
                <span className="status-inactive">Disconnected</span>
              )}
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}

          {/* Live waveform */}
          <div className="waveform-container">
            <LiveWaveform
              active={isActive}
              processing={isActive}
              barColor="rgb(115 115 115)"
              fadeEdges={true}
              fadeWidth={24}
              height={64}
            />
          </div>

          {/* Partial transcript */}
          {(isActive || partialTranscript) && (
            <div className="transcript-section">
              <h2 className="section-title">Live Transcript</h2>
              <div className="transcript-box">
                <p className="transcript-text">
                  {partialTranscript || <span className="transcript-placeholder">Listening...</span>}
                </p>
              </div>
            </div>
          )}

          {/* Committed transcript history */}
          {committedHistory.length > 0 && (
            <div className="transcript-section">
              <h2 className="section-title">History</h2>
              <div className="history-list">
                {committedHistory.map((text, index) => (
                  <div key={index} className="history-item">
                    {text}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions when not started */}
          {!isActive && !isConnecting && committedHistory.length === 0 && (
            <div className="instructions">
              Click "Start" to begin transcribing audio from your microphone.
            </div>
          )}
        </div>

        {/* Backend connection info */}
        <footer className="footer">
          <p className="footer-text">
            Backend: <code>{backendUrl}</code>
          </p>
          <p className="footer-note">
            ✅ API Key secured in Backend | ❌ No sensitive data in Frontend
          </p>
        </footer>
      </div>
    </main>
  );
}
