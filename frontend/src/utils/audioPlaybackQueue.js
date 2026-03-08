/**
 * Audio Playback Queue Manager
 * Manages queuing and continuous playback of AudioBuffers without gaps
 */

export class AudioPlaybackQueue {
  constructor(audioContext) {
    if (!audioContext) {
      throw new Error('AudioContext is required for AudioPlaybackQueue');
    }
    
    this.audioContext = audioContext;
    this.queue = []; // Queue of AudioBuffers waiting to be played
    this.isPlaying = false;
    this.currentSource = null; // Currently playing AudioBufferSourceNode
    this.nextStartTime = 0; // Scheduled start time for next buffer
    this.onPlaybackEnd = null; // Callback when queue finishes playing
  }

  /**
   * Add an AudioBuffer to the playback queue
   * @param {AudioBuffer} audioBuffer - AudioBuffer to enqueue
   */
  enqueue(audioBuffer) {
    try {
      if (!audioBuffer || !(audioBuffer instanceof AudioBuffer)) {
        throw new Error('Invalid AudioBuffer provided to enqueue');
      }
      
      this.queue.push(audioBuffer);
      console.log(`Audio buffer enqueued. Queue length: ${this.queue.length}, Duration: ${audioBuffer.duration.toFixed(2)}s`);
      
      // Start playing if not already playing
      if (!this.isPlaying) {
        this.play();
      }
    } catch (error) {
      console.error('Error enqueueing audio buffer:', error);
      throw error;
    }
  }

  /**
   * Remove and return the next AudioBuffer from the queue
   * @returns {AudioBuffer|null} Next AudioBuffer or null if queue is empty
   */
  dequeue() {
    if (this.queue.length === 0) {
      return null;
    }
    
    return this.queue.shift();
  }

  /**
   * Start continuous playback of queued AudioBuffers
   * Schedules buffers to play back-to-back without gaps
   */
  play() {
    if (this.isPlaying) {
      return; // Already playing
    }
    
    this.isPlaying = true;
    
    // Initialize start time to current audio context time
    this.nextStartTime = this.audioContext.currentTime;
    
    // Start the playback loop
    this._playNext();
  }

  /**
   * Internal method to play the next buffer in the queue
   * Schedules buffers continuously to avoid gaps
   * @private
   */
  _playNext() {
    try {
      if (!this.isPlaying) {
        return;
      }
      
      const audioBuffer = this.dequeue();
      
      if (!audioBuffer) {
        // Queue is empty, stop playing
        this.isPlaying = false;
        this.currentSource = null;
        this.nextStartTime = 0;
        console.log('Audio playback queue finished');
        
        // Notify that playback has ended
        if (this.onPlaybackEnd) {
          this.onPlaybackEnd();
        }
        
        return;
      }
      
      // Create a buffer source node
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);
      
      // Store current source for potential interruption
      this.currentSource = source;
      
      // Calculate when this buffer should start
      const currentTime = this.audioContext.currentTime;
      const startTime = Math.max(currentTime, this.nextStartTime);
      
      // Schedule the next buffer to start after this one finishes
      this.nextStartTime = startTime + audioBuffer.duration;
      
      // Set up the ended event to play the next buffer
      source.onended = () => {
        // Only continue if we're still in playing state
        if (this.isPlaying) {
          this._playNext();
        }
      };
      
      // Start playback at the scheduled time
      source.start(startTime);
      console.log(`Playing audio buffer: duration=${audioBuffer.duration.toFixed(2)}s, startTime=${startTime.toFixed(2)}s`);
    } catch (error) {
      console.error('Error playing next audio buffer:', error);
      this.isPlaying = false;
      this.currentSource = null;
      
      // Try to continue with next buffer if available
      if (this.queue.length > 0) {
        setTimeout(() => this._playNext(), 100);
      }
    }
  }

  /**
   * Clear the playback queue and stop current playback
   * Used for interrupt handling
   */
  clear() {
    try {
      console.log('Clearing audio playback queue');
      
      // Stop current playback if any
      if (this.currentSource) {
        try {
          this.currentSource.stop();
        } catch (e) {
          // Source may have already stopped, ignore error
          console.warn('Could not stop current audio source:', e.message);
        }
        this.currentSource = null;
      }
      
      // Clear the queue
      const clearedCount = this.queue.length;
      this.queue = [];
      
      // Reset state
      this.isPlaying = false;
      this.nextStartTime = 0;
      
      console.log(`Cleared ${clearedCount} audio buffers from queue`);
    } catch (error) {
      console.error('Error clearing audio playback queue:', error);
      // Force reset state even if error occurs
      this.queue = [];
      this.isPlaying = false;
      this.currentSource = null;
      this.nextStartTime = 0;
    }
  }

  /**
   * Get the current queue length
   * @returns {number} Number of buffers in queue
   */
  get length() {
    return this.queue.length;
  }

  /**
   * Check if queue is currently playing
   * @returns {boolean} True if playing
   */
  get playing() {
    return this.isPlaying;
  }
}
