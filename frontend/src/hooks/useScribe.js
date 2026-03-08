import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Custom useScribe Hook
 * Migrated from @elevenlabs/react but connects to our Backend instead
 * Handles WebSocket connection, audio streaming, and transcription
 * 
 * Requirements: Replace ElevenLabs direct connection with Backend proxy
 */

const CommitStrategy = {
  VAD: 'vad',
  MANUAL: 'manual',
};

export { CommitStrategy };

export const useScribe = ({
  modelId = 'scribe_v2_realtime',
  commitStrategy = CommitStrategy.VAD,
  vadSilenceThresholdSecs = 1.5,
  vadThreshold = 0.01, // Lowered from 0.4 - adjust based on your microphone
  onPartialTranscript,
  onCommittedTranscript,
  onError,
  backendUrl = 'ws://localhost:8000/ws/audio-stream', // Backend URL instead of ElevenLabs
}) => {
  const [status, setStatus] = useState('disconnected'); // 'disconnected' | 'connecting' | 'connected' | 'transcribing'
  
  const wsRef = useRef(null);
  const audioContextRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioWorkletNodeRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  /**
   * Connect to Backend WebSocket with microphone access
   * CRITICAL CHANGE: Connects to Backend, not directly to ElevenLabs
   */
  const connect = useCallback(
    async ({ microphone = {} } = {}) => {
      try {
        setStatus('connecting');

        // Request microphone access
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: microphone.echoCancellation ?? true,
            noiseSuppression: microphone.noiseSuppression ?? true,
            autoGainControl: microphone.autoGainControl ?? true,
          },
        });

        mediaStreamRef.current = stream;

        // Create audio context for processing
        const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
        const audioContext = new AudioContextConstructor({ sampleRate: 16000 });
        audioContextRef.current = audioContext;

        // Connect to Backend WebSocket (NOT ElevenLabs directly)
        const ws = new WebSocket(backendUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('✅ Connected to Backend WebSocket');
          console.log('📍 URL:', backendUrl);
          setStatus('connected');

          // Send configuration to backend
          const config = {
            type: 'config',
            modelId,
            commitStrategy,
            vadSilenceThresholdSecs,
            vadThreshold,
          };
          console.log('📤 Sending config:', config);
          ws.send(JSON.stringify(config));

          // Setup audio processing
          setupAudioProcessing(audioContext, stream, ws);
        };

        ws.onmessage = event => {
          try {
            const message = JSON.parse(event.data);
            
            // Debug: log all messages
            console.log('📥 Received message:', message.type, message);

            switch (message.type) {
              case 'transcript_partial':
                console.log('📝 Partial transcript:', message.text);
                setStatus('transcribing');
                onPartialTranscript?.({ text: message.text });
                break;

              case 'transcript_committed':
                console.log('✅ Committed transcript:', message.text);
                onCommittedTranscript?.({ text: message.text });
                setStatus('connected');
                break;

              case 'status':
                // Handle status updates from backend
                console.log('📊 Status update:', message.state, message.message);
                if (message.state === 'listening') {
                  setStatus('transcribing');
                } else if (message.state === 'idle') {
                  setStatus('connected');
                }
                break;

              case 'error':
                console.error('❌ Backend error:', message.message);
                onError?.(new Error(message.message || 'Backend error'));
                break;

              default:
                console.log('❓ Unknown message type:', message.type);
            }
          } catch (err) {
            console.error('Failed to parse message:', err);
          }
        };

        ws.onerror = error => {
          console.error('WebSocket error:', error);
          onError?.(new Error('WebSocket connection error'));
          setStatus('disconnected');
        };

        ws.onclose = () => {
          console.log('WebSocket closed');
          setStatus('disconnected');
          cleanup();
        };
      } catch (error) {
        console.error('Failed to connect:', error);
        onError?.(error);
        setStatus('disconnected');
      }
    },
    [
      backendUrl,
      modelId,
      commitStrategy,
      vadSilenceThresholdSecs,
      vadThreshold,
      onPartialTranscript,
      onCommittedTranscript,
      onError,
    ]
  );

  /**
   * Setup audio processing pipeline
   * Captures microphone audio and sends to Backend
   */
  const setupAudioProcessing = useCallback((audioContext, stream, ws) => {
    const source = audioContext.createMediaStreamSource(stream);
    
    // Use ScriptProcessorNode for audio processing (fallback for older browsers)
    // Modern approach would use AudioWorklet, but this is simpler for migration
    const bufferSize = 4096;
    const processor = audioContext.createScriptProcessor(bufferSize, 1, 1);

    // VAD state tracking
    let isSpeaking = false;
    let silenceStart = null;
    const silenceThreshold = vadSilenceThresholdSecs * 1000; // Convert to ms
    const energyThreshold = vadThreshold;

    processor.onaudioprocess = event => {
      if (ws.readyState === WebSocket.OPEN) {
        const inputData = event.inputBuffer.getChannelData(0);
        
        // Calculate audio energy for VAD
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += inputData[i] * inputData[i];
        }
        const rms = Math.sqrt(sum / inputData.length);
        const isVoiceDetected = rms > energyThreshold;
        
        // Debug: Log audio levels periodically
        if (Math.random() < 0.02) { // ~2% of chunks
          console.log(`🎚️ Audio RMS: ${rms.toFixed(6)}, Threshold: ${energyThreshold}, Voice: ${isVoiceDetected}`);
        }

        // VAD logic
        if (isVoiceDetected) {
          if (!isSpeaking) {
            console.log('🎤 Speech started');
            isSpeaking = true;
          }
          silenceStart = null;
        } else if (isSpeaking) {
          if (silenceStart === null) {
            silenceStart = Date.now();
          } else {
            const silenceDuration = Date.now() - silenceStart;
            if (silenceDuration >= silenceThreshold) {
              console.log('🛑 Speech ended (silence detected)');
              isSpeaking = false;
              silenceStart = null;
              
              // Send speech_end signal to backend
              console.log('📤 Sending speech_end signal');
              ws.send(
                JSON.stringify({
                  type: 'speech_end',
                  timestamp: Date.now()
                })
              );
            }
          }
        }
        
        // Convert Float32Array to Int16Array (PCM 16-bit)
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }

        // Convert Int16Array to base64 string
        const bytes = new Uint8Array(pcmData.buffer);
        let binary = '';
        for (let i = 0; i < bytes.length; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64Audio = btoa(binary);

        // TEMPORARY: Send ALL audio to debug (bypass VAD)
        // TODO: Re-enable VAD once we confirm audio is working
        ws.send(
          JSON.stringify({
            type: 'audio',
            data: base64Audio,
            timestamp: Date.now()
          })
        );
        
        // Log periodically
        if (Math.random() < 0.02) { // ~2% of chunks
          console.log('📤 Sending audio chunk:', base64Audio.substring(0, 20) + '...', 'RMS:', rms.toFixed(6));
        }
      }
    };

    source.connect(processor);
    processor.connect(audioContext.destination);

    audioWorkletNodeRef.current = processor;
  }, [vadSilenceThresholdSecs, vadThreshold]);

  /**
   * Disconnect from Backend and cleanup resources
   */
  const disconnect = useCallback(() => {
    cleanup();
    setStatus('disconnected');
  }, []);

  /**
   * Cleanup all resources
   */
  const cleanup = useCallback(() => {
    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // Stop microphone
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      if (audioWorkletNodeRef.current) {
        audioWorkletNodeRef.current.disconnect();
        audioWorkletNodeRef.current = null;
      }
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Clear reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    status,
    connect,
    disconnect,
  };
};

export default useScribe;
