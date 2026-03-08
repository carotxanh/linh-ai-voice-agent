import { useState, useEffect, useRef, useCallback } from 'react';
import { VoiceWebSocket } from '../utils/websocket.js';

/**
 * useWebSocket - Custom hook for managing WebSocket connection
 * 
 * @param {string} url - WebSocket endpoint URL
 * @param {Function} onMessage - Message handler callback
 * @param {Function} onError - Error handler callback
 * @returns {Object} WebSocket state and methods
 */
export function useWebSocket(url, onMessage, onError) {
  // State for connection status and reconnection attempts
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [connectionError, setConnectionError] = useState(null);

  // Ref to hold the WebSocket instance
  const wsRef = useRef(null);

  // Stable callback references
  const onMessageRef = useRef(onMessage);
  const onErrorRef = useRef(onError);

  // Update refs when callbacks change
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  /**
   * Handle WebSocket open event
   */
  const handleOpen = useCallback(() => {
    setIsConnected(true);
    setConnectionError(null);
    setReconnectAttempts(0);
  }, []);

  /**
   * Handle WebSocket close event
   */
  const handleClose = useCallback(() => {
    setIsConnected(false);
  }, []);

  /**
   * Handle WebSocket message event
   */
  const handleMessage = useCallback((message) => {
    if (onMessageRef.current) {
      onMessageRef.current(message);
    }
  }, []);

  /**
   * Handle WebSocket error event
   */
  const handleError = useCallback((error) => {
    setConnectionError(error);
    
    // Update reconnect attempts from WebSocket instance
    if (wsRef.current) {
      setReconnectAttempts(wsRef.current.getReconnectAttempts());
    }

    // Notify user through error handler
    if (onErrorRef.current) {
      onErrorRef.current(error);
    }
  }, []);

  /**
   * Connect to WebSocket
   */
  const connect = useCallback(() => {
    try {
      if (!url) {
        const error = new Error('WebSocket URL is required. Please check your configuration.');
        console.error('Configuration error:', error.message);
        handleError(error);
        return;
      }

      // Validate URL format
      try {
        const urlObj = new URL(url);
        if (!urlObj.protocol.startsWith('ws')) {
          throw new Error(`Invalid WebSocket protocol: ${urlObj.protocol}. Expected ws:// or wss://`);
        }
      } catch (urlError) {
        const error = new Error(`Invalid WebSocket URL: ${url}. ${urlError.message}`);
        console.error('URL validation error:', error.message);
        handleError(error);
        return;
      }

      // Clean up existing connection
      if (wsRef.current) {
        wsRef.current.disconnect();
      }

      // Create new WebSocket instance
      wsRef.current = new VoiceWebSocket(url, {
        onOpen: handleOpen,
        onMessage: handleMessage,
        onClose: handleClose,
        onError: handleError,
        reconnectDelay: 1000,
        maxReconnectDelay: 30000
      });

      // Establish connection
      wsRef.current.connect();
    } catch (error) {
      console.error('Error in WebSocket connect:', error);
      handleError(new Error(`Failed to connect: ${error.message}`));
    }
  }, [url, handleOpen, handleMessage, handleClose, handleError]);

  /**
   * Disconnect from WebSocket
   */
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.disconnect();
      wsRef.current = null;
    }
    setIsConnected(false);
    setReconnectAttempts(0);
    setConnectionError(null);
  }, []);

  /**
   * Send data through WebSocket
   */
  const send = useCallback((type, data) => {
    if (!wsRef.current) {
      console.warn('Cannot send: WebSocket not initialized');
      return false;
    }
    return wsRef.current.send(type, data);
  }, []);

  /**
   * Send audio chunk
   */
  const sendAudio = useCallback((base64Data) => {
    if (!wsRef.current) {
      console.warn('Cannot send audio: WebSocket not initialized');
      return false;
    }
    return wsRef.current.sendAudio(base64Data);
  }, []);

  /**
   * Send interrupt signal
   */
  const sendInterrupt = useCallback(() => {
    if (!wsRef.current) {
      console.warn('Cannot send interrupt: WebSocket not initialized');
      return false;
    }
    return wsRef.current.sendInterrupt();
  }, []);

  /**
   * Send speech end signal for transcription finalization
   */
  const sendSpeechEnd = useCallback(() => {
    if (!wsRef.current) {
      console.warn('Cannot send speech end: WebSocket not initialized');
      return false;
    }
    return wsRef.current.sendSpeechEnd();
  }, []);

  /**
   * Send configuration
   */
  const sendConfig = useCallback((config) => {
    if (!wsRef.current) {
      console.warn('Cannot send config: WebSocket not initialized');
      return false;
    }
    return wsRef.current.sendConfig(config);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect();
      }
    };
  }, []);

  return {
    isConnected,
    reconnectAttempts,
    connectionError,
    connect,
    disconnect,
    send,
    sendAudio,
    sendInterrupt,
    sendSpeechEnd,
    sendConfig
  };
}
