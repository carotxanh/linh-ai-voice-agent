/**
 * VoiceWebSocket - WebSocket client for voice agent communication
 * Handles connection, reconnection, and message routing for audio streaming
 */
export class VoiceWebSocket {
  constructor(url, {
    onOpen = null,
    onMessage = null,
    onClose = null,
    onError = null,
    reconnectDelay = 1000,
    maxReconnectDelay = 30000
  } = {}) {
    this.url = url;
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.reconnectDelay = reconnectDelay;
    this.maxReconnectDelay = maxReconnectDelay;
    this.currentReconnectDelay = reconnectDelay;
    this.reconnectTimeout = null;
    this.shouldReconnect = true;
    
    // Event handlers
    this.onOpen = onOpen;
    this.onMessage = onMessage;
    this.onClose = onClose;
    this.onError = onError;
  }

  /**
   * Establish WebSocket connection
   */
  connect() {
    try {
      // Validate URL before connecting
      if (!this.url) {
        const error = new Error('WebSocket URL is required');
        console.error('Connection error:', error.message);
        if (this.onError) {
          this.onError(error);
        }
        return;
      }

      this.socket = new WebSocket(this.url);
      this.shouldReconnect = true;

      this.socket.onopen = (event) => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.currentReconnectDelay = this.reconnectDelay;
        console.log('WebSocket connected successfully');
        
        if (this.onOpen) {
          this.onOpen(event);
        }
      };

      this.socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.routeMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error, 'Raw data:', event.data);
          if (this.onError) {
            this.onError(new Error(`Invalid message format: ${error.message}`));
          }
        }
      };

      this.socket.onclose = (event) => {
        this.isConnected = false;
        console.log(`WebSocket closed: code=${event.code}, reason=${event.reason}, clean=${event.wasClean}`);
        
        if (this.onClose) {
          this.onClose(event);
        }

        // Attempt reconnection if not manually closed
        if (this.shouldReconnect && !event.wasClean) {
          this.reconnect();
        }
      };

      this.socket.onerror = (event) => {
        console.error('WebSocket error event:', event);
        if (this.onError) {
          this.onError(new Error('WebSocket connection error. Please check your network connection and backend URL.'));
        }
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      if (this.onError) {
        this.onError(new Error(`WebSocket initialization failed: ${error.message}`));
      }
    }
  }

  /**
   * Close WebSocket connection gracefully
   */
  disconnect() {
    this.shouldReconnect = false;
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.socket) {
      this.socket.close(1000, 'Client disconnect');
      this.socket = null;
    }
    
    this.isConnected = false;
  }

  /**
   * Send typed message to backend
   * @param {string} type - Message type
   * @param {any} data - Message data
   */
  send(type, data = {}) {
    if (!this.isConnected || !this.socket) {
      console.warn('Cannot send message: WebSocket not connected');
      return false;
    }

    if (!type) {
      console.error('Message type is required');
      return false;
    }

    try {
      const message = {
        type,
        ...data,
        timestamp: Date.now()
      };
      
      this.socket.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('Failed to send message:', error, 'Message type:', type);
      if (this.onError) {
        this.onError(new Error(`Failed to send message: ${error.message}`));
      }
      return false;
    }
  }

  /**
   * Send audio chunk to backend
   * @param {string} base64Data - Base64 encoded audio data
   */
  sendAudio(base64Data) {
    return this.send('audio', { data: base64Data });
  }

  /**
   * Send interrupt signal to backend
   */
  sendInterrupt() {
    return this.send('interrupt');
  }

  /**
   * Send speech end signal to backend for transcription finalization
   */
  sendSpeechEnd() {
    return this.send('speech_end');
  }

  /**
   * Send configuration to backend
   * @param {object} config - Configuration object
   */
  sendConfig(config) {
    return this.send('config', config);
  }

  /**
   * Reconnect with exponential backoff
   */
  reconnect() {
    if (!this.shouldReconnect) {
      return;
    }

    this.reconnectAttempts++;
    
    console.log(`Reconnecting... Attempt ${this.reconnectAttempts} (delay: ${this.currentReconnectDelay}ms)`);

    this.reconnectTimeout = setTimeout(() => {
      this.connect();
      
      // Exponential backoff: double the delay for next attempt
      this.currentReconnectDelay = Math.min(
        this.currentReconnectDelay * 2,
        this.maxReconnectDelay
      );
    }, this.currentReconnectDelay);
  }

  /**
   * Route incoming messages to appropriate handlers
   * @param {object} message - Parsed message object
   */
  routeMessage(message) {
    if (!message || !message.type) {
      console.warn('Received message without type:', message);
      return;
    }

    if (this.onMessage) {
      this.onMessage(message);
    }
  }

  /**
   * Get current connection status
   * @returns {boolean} Connection status
   */
  getConnectionStatus() {
    return this.isConnected;
  }

  /**
   * Get number of reconnection attempts
   * @returns {number} Reconnection attempts
   */
  getReconnectAttempts() {
    return this.reconnectAttempts;
  }
}
