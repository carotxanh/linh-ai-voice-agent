import { useState, useRef, useCallback, useEffect } from 'react';
import {
  createAudioContext,
  resampleAudio,
  convertToMono,
  encodePCMToBase64,
  detectVAD
} from '../utils/audioProcessor.js';

/**
 * Custom hook for managing audio recording with real-time processing
 * Handles microphone access, audio processing, VAD, and cleanup
 * 
 * @returns {Object} Audio recorder state and controls
 */
export function useAudioRecorder() {
  // State management
  const [isRecording, setIsRecording] = useState(false);
  const [audioData, setAudioData] = useState(new Float32Array(0));
  const [error, setError] = useState(null);
  const [vadActive, setVadActive] = useState(false);

  // Refs for audio resources (don't trigger re-renders)
  const mediaStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const processorNodeRef = useRef(null);
  const animationFrameRef = useRef(null);
  const onChunkCallbackRef = useRef(null);
  
  // VAD state tracking
  const vadStateRef = useRef({
    isSpeaking: false,
    silenceStart: null,
    silenceDuration: 1500, // 1.5 seconds
    vadThreshold: 0.4
  });

  /**
   * Request microphone permission and get MediaStream
   * Requirements: 1.1, 1.2
   */
  const requestMicrophonePermission = useCallback(async () => {
    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia is not supported in this browser');
      }

      // Request microphone with audio constraints
      // Requirement 1.2: echoCancellation, noiseSuppression, autoGainControl
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1 // Request mono if possible
        },
        video: false
      });

      mediaStreamRef.current = stream;
      return stream;
    } catch (err) {
      const errorMessage = err.name === 'NotAllowedError' 
        ? 'Microphone access denied. Please allow microphone access in your browser settings.'
        : err.name === 'NotFoundError'
        ? 'No microphone found. Please connect a microphone and try again.'
        : `Failed to access microphone: ${err.message}`;
      
      setError(new Error(errorMessage));
      throw err;
    }
  }, []);

  /**
   * Setup audio processing pipeline with AudioContext and ScriptProcessor
   * Requirements: 2.1
   */
  const setupAudioProcessing = useCallback(async (stream) => {
    try {
      // Create AudioContext
      const audioContext = createAudioContext();
      audioContextRef.current = audioContext;

      // Create analyser for waveform visualization and VAD
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      // Create source from MediaStream
      const source = audioContext.createMediaStreamSource(stream);
      sourceNodeRef.current = source;

      // Create ScriptProcessor for audio processing
      // Note: ScriptProcessor is deprecated but AudioWorklet requires separate file
      // For this implementation, we'll use ScriptProcessor for simplicity
      const bufferSize = 4096;
      const processor = audioContext.createScriptProcessor(bufferSize, 1, 1);
      processorNodeRef.current = processor;

      // Connect audio graph: source -> analyser -> processor -> destination
      source.connect(analyser);
      analyser.connect(processor);
      processor.connect(audioContext.destination);

      // Setup audio processing callback
      processor.onaudioprocess = (event) => {
        if (!isRecording) return;

        const inputData = event.inputBuffer.getChannelData(0);
        processAudioChunk(inputData, audioContext.sampleRate);
      };

      return { audioContext, analyser, source, processor };
    } catch (err) {
      const errorMessage = `Failed to setup audio processing: ${err.message}`;
      setError(new Error(errorMessage));
      throw err;
    }
  }, [isRecording]);

  /**
   * Process audio chunk: resample, encode, and send
   * Requirements: 2.2, 2.3, 2.4, 6.1, 6.2, 6.3, 6.5
   */
  const processAudioChunk = useCallback((audioChunk, sampleRate) => {
    try {
      // Requirement 2.2: Resample to 16kHz
      const targetSampleRate = 16000;
      let processedAudio = audioChunk;
      
      if (sampleRate !== targetSampleRate) {
        processedAudio = resampleAudio(audioChunk, sampleRate, targetSampleRate);
      }

      // Requirement 6.1: VAD analysis
      const isVoiceDetected = detectVAD(processedAudio, vadStateRef.current.vadThreshold);
      
      // Requirement 6.2: Speech start detection
      if (isVoiceDetected && !vadStateRef.current.isSpeaking) {
        vadStateRef.current.isSpeaking = true;
        vadStateRef.current.silenceStart = null;
        setVadActive(true);
      }
      
      // Requirement 6.3: Silence detection (>1.5s)
      if (!isVoiceDetected && vadStateRef.current.isSpeaking) {
        if (vadStateRef.current.silenceStart === null) {
          vadStateRef.current.silenceStart = Date.now();
        } else {
          const silenceDuration = Date.now() - vadStateRef.current.silenceStart;
          
          if (silenceDuration >= vadStateRef.current.silenceDuration) {
            // Requirement 6.5: Signal speech end
            vadStateRef.current.isSpeaking = false;
            vadStateRef.current.silenceStart = null;
            setVadActive(false);
            
            // Send finalization signal through callback
            if (onChunkCallbackRef.current) {
              onChunkCallbackRef.current({
                type: 'speech_end',
                timestamp: Date.now()
              });
            }
          }
        }
      }

      // Update audio data for visualization
      setAudioData(new Float32Array(processedAudio));

      // Requirement 2.4: Encode to base64 and send
      if (vadStateRef.current.isSpeaking && onChunkCallbackRef.current) {
        const base64Audio = encodePCMToBase64(processedAudio);
        onChunkCallbackRef.current({
          type: 'audio',
          data: base64Audio,
          timestamp: Date.now()
        });
      }
    } catch (err) {
      console.error('Error processing audio chunk:', err);
      setError(new Error(`Audio processing error: ${err.message}`));
    }
  }, []);

  /**
   * Cleanup audio resources
   * Requirements: 1.5
   */
  const cleanup = useCallback(() => {
    try {
      // Cancel animation frame if running
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      // Disconnect and cleanup audio nodes
      if (processorNodeRef.current) {
        processorNodeRef.current.onaudioprocess = null;
        processorNodeRef.current.disconnect();
        processorNodeRef.current = null;
      }

      if (sourceNodeRef.current) {
        sourceNodeRef.current.disconnect();
        sourceNodeRef.current = null;
      }

      if (analyserRef.current) {
        analyserRef.current.disconnect();
        analyserRef.current = null;
      }

      // Close AudioContext
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }

      // Stop all media tracks and release microphone
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => {
          track.stop();
        });
        mediaStreamRef.current = null;
      }

      // Reset VAD state
      vadStateRef.current = {
        isSpeaking: false,
        silenceStart: null,
        silenceDuration: 1500,
        vadThreshold: 0.4
      };

      // Reset state
      setIsRecording(false);
      setAudioData(new Float32Array(0));
      setVadActive(false);
      onChunkCallbackRef.current = null;
    } catch (err) {
      console.error('Error during cleanup:', err);
    }
  }, []);

  /**
   * Start recording audio
   * Requirements: 1.1, 1.2, 2.1
   */
  const startRecording = useCallback(async (onChunk, options = {}) => {
    try {
      // Clear any previous errors
      setError(null);

      // Store callback for audio chunks
      onChunkCallbackRef.current = onChunk;

      // Configure VAD if provided
      if (options.vadThreshold !== undefined) {
        vadStateRef.current.vadThreshold = options.vadThreshold;
      }
      if (options.silenceDuration !== undefined) {
        vadStateRef.current.silenceDuration = options.silenceDuration;
      }

      // Request microphone permission
      const stream = await requestMicrophonePermission();

      // Setup audio processing
      await setupAudioProcessing(stream);

      // Start recording
      setIsRecording(true);

      return true;
    } catch (err) {
      console.error('Failed to start recording:', err);
      setError(err);
      cleanup();
      return false;
    }
  }, [requestMicrophonePermission, setupAudioProcessing, cleanup]);

  /**
   * Stop recording audio
   * Requirements: 1.5
   */
  const stopRecording = useCallback(() => {
    cleanup();
  }, [cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    isRecording,
    audioData,
    error,
    vadActive,
    startRecording,
    stopRecording
  };
}
