/**
 * Audio Processing Utilities
 * Handles audio context creation, resampling, encoding/decoding, and VAD
 */

/**
 * Create and initialize an AudioContext with proper sample rate
 * @returns {AudioContext} Initialized AudioContext
 */
export function createAudioContext() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    
    if (!AudioContextClass) {
      const error = new Error('AudioContext is not supported in this browser. Please use a modern browser like Chrome, Firefox, or Safari.');
      console.error('Browser compatibility error:', error.message);
      throw error;
    }
    
    // Create context with default sample rate (browser will handle)
    const audioContext = new AudioContextClass();
    
    return audioContext;
  } catch (error) {
    console.error('Failed to create AudioContext:', error);
    throw error;
  }
}

/**
 * Resample audio data to target sample rate (16kHz for voice processing)
 * Uses linear interpolation for resampling
 * @param {Float32Array} audioData - Input audio data
 * @param {number} fromRate - Source sample rate
 * @param {number} toRate - Target sample rate (typically 16000)
 * @returns {Float32Array} Resampled audio data
 */
export function resampleAudio(audioData, fromRate, toRate) {
  try {
    if (!audioData || audioData.length === 0) {
      console.warn('Empty audio data provided for resampling');
      return new Float32Array(0);
    }
    
    if (fromRate <= 0 || toRate <= 0) {
      throw new Error(`Invalid sample rates: fromRate=${fromRate}, toRate=${toRate}`);
    }
    
    if (fromRate === toRate) {
      return audioData;
    }
    
    const ratio = fromRate / toRate;
    const newLength = Math.round(audioData.length / ratio);
    const result = new Float32Array(newLength);
    
    for (let i = 0; i < newLength; i++) {
      const srcIndex = i * ratio;
      const srcIndexFloor = Math.floor(srcIndex);
      const srcIndexCeil = Math.min(srcIndexFloor + 1, audioData.length - 1);
      const fraction = srcIndex - srcIndexFloor;
      
      // Linear interpolation
      result[i] = audioData[srcIndexFloor] * (1 - fraction) + 
                  audioData[srcIndexCeil] * fraction;
    }
    
    return result;
  } catch (error) {
    console.error('Error resampling audio:', error);
    throw new Error(`Audio resampling failed: ${error.message}`);
  }
}

/**
 * Convert stereo audio to mono by averaging channels
 * @param {Float32Array} audioData - Interleaved stereo audio data
 * @param {number} channels - Number of channels (2 for stereo)
 * @returns {Float32Array} Mono audio data
 */
export function convertToMono(audioData, channels) {
  try {
    if (!audioData || audioData.length === 0) {
      console.warn('Empty audio data provided for mono conversion');
      return new Float32Array(0);
    }
    
    if (channels <= 0) {
      throw new Error(`Invalid channel count: ${channels}`);
    }
    
    if (channels === 1) {
      return audioData;
    }
    
    const monoLength = Math.floor(audioData.length / channels);
    const result = new Float32Array(monoLength);
    
    for (let i = 0; i < monoLength; i++) {
      let sum = 0;
      for (let channel = 0; channel < channels; channel++) {
        sum += audioData[i * channels + channel];
      }
      result[i] = sum / channels;
    }
    
    return result;
  } catch (error) {
    console.error('Error converting to mono:', error);
    throw new Error(`Mono conversion failed: ${error.message}`);
  }
}

/**
 * Encode PCM audio data to base64 string for transmission
 * Converts Float32Array to Int16 PCM format first
 * @param {Float32Array} pcmData - PCM audio data (-1.0 to 1.0)
 * @returns {string} Base64 encoded audio data
 */
export function encodePCMToBase64(pcmData) {
  try {
    if (!pcmData || pcmData.length === 0) {
      console.warn('Empty PCM data provided for encoding');
      return '';
    }
    
    // Convert Float32 (-1.0 to 1.0) to Int16 (-32768 to 32767)
    const int16Data = new Int16Array(pcmData.length);
    
    for (let i = 0; i < pcmData.length; i++) {
      // Clamp to [-1, 1] range and convert to Int16
      const clamped = Math.max(-1, Math.min(1, pcmData[i]));
      int16Data[i] = Math.round(clamped * 32767);
    }
    
    // Convert Int16Array to Uint8Array (byte array)
    const uint8Data = new Uint8Array(int16Data.buffer);
    
    // Convert to base64
    let binary = '';
    for (let i = 0; i < uint8Data.length; i++) {
      binary += String.fromCharCode(uint8Data[i]);
    }
    
    return btoa(binary);
  } catch (error) {
    console.error('Error encoding PCM to base64:', error);
    throw new Error(`PCM encoding failed: ${error.message}`);
  }
}

/**
 * Decode base64 string back to PCM audio data
 * @param {string} base64 - Base64 encoded audio data
 * @returns {Float32Array} PCM audio data (-1.0 to 1.0)
 */
export function decodeBase64ToPCM(base64) {
  try {
    if (!base64 || base64.length === 0) {
      console.warn('Empty base64 data provided for decoding');
      return new Float32Array(0);
    }
    
    // Decode base64 to binary string
    const binary = atob(base64);
    
    // Convert binary string to Uint8Array
    const uint8Data = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      uint8Data[i] = binary.charCodeAt(i);
    }
    
    // Convert Uint8Array to Int16Array
    const int16Data = new Int16Array(uint8Data.buffer);
    
    // Convert Int16 to Float32 (-32768 to 32767 -> -1.0 to 1.0)
    const float32Data = new Float32Array(int16Data.length);
    for (let i = 0; i < int16Data.length; i++) {
      float32Data[i] = int16Data[i] / 32768.0;
    }
    
    return float32Data;
  } catch (error) {
    console.error('Error decoding base64 to PCM:', error);
    throw new Error(`PCM decoding failed: ${error.message}`);
  }
}

/**
 * Create an AudioBuffer from PCM data for playback
 * @param {Float32Array} pcmData - PCM audio data
 * @param {number} sampleRate - Sample rate (e.g., 16000)
 * @param {AudioContext} audioContext - AudioContext instance
 * @returns {AudioBuffer} Playable AudioBuffer
 */
export function createAudioBuffer(pcmData, sampleRate, audioContext) {
  try {
    if (!audioContext) {
      throw new Error('AudioContext is required to create AudioBuffer');
    }
    
    if (!pcmData || pcmData.length === 0) {
      throw new Error('PCM data is empty or invalid');
    }
    
    if (!sampleRate || sampleRate <= 0) {
      throw new Error(`Invalid sample rate: ${sampleRate}`);
    }
    
    // Create buffer with 1 channel (mono)
    const audioBuffer = audioContext.createBuffer(
      1, // number of channels
      pcmData.length,
      sampleRate
    );
    
    // Copy PCM data to buffer
    const channelData = audioBuffer.getChannelData(0);
    channelData.set(pcmData);
    
    return audioBuffer;
  } catch (error) {
    console.error('Error creating AudioBuffer:', error);
    throw new Error(`AudioBuffer creation failed: ${error.message}`);
  }
}

/**
 * Detect voice activity in audio data using energy-based VAD
 * @param {Float32Array} audioData - Audio data to analyze
 * @param {number} threshold - Energy threshold for voice detection (0.0 to 1.0, default 0.4)
 * @returns {boolean} True if voice activity detected
 */
export function detectVAD(audioData, threshold = 0.4) {
  try {
    if (!audioData || audioData.length === 0) {
      return false;
    }
    
    if (threshold < 0 || threshold > 1) {
      console.warn(`VAD threshold ${threshold} out of range [0, 1], using default 0.4`);
      threshold = 0.4;
    }
    
    // Calculate RMS (Root Mean Square) energy
    let sumSquares = 0;
    for (let i = 0; i < audioData.length; i++) {
      sumSquares += audioData[i] * audioData[i];
    }
    
    const rms = Math.sqrt(sumSquares / audioData.length);
    
    // Voice detected if RMS exceeds threshold
    return rms > threshold;
  } catch (error) {
    console.error('Error in VAD detection:', error);
    return false;
  }
}

/**
 * Decode base64 audio data and create AudioBuffer
 * Automatically detects format (PCM or MP3) and routes to appropriate handler
 * @param {string} base64Data - Base64 encoded audio data
 * @param {string} format - Audio format: 'pcm' or 'mp3'
 * @param {number} sampleRate - Sample rate for PCM format (e.g., 16000, 24000)
 * @param {AudioContext} audioContext - AudioContext instance
 * @returns {Promise<AudioBuffer>} Decoded AudioBuffer ready for playback
 */
export async function decodeAudioData(base64Data, format, sampleRate, audioContext) {
  try {
    if (!base64Data) {
      throw new Error('Base64 audio data is required');
    }
    
    if (!audioContext) {
      throw new Error('AudioContext is required for audio decoding');
    }
    
    // Route to appropriate decoder based on format
    if (format === 'pcm') {
      return decodePCMFormat(base64Data, sampleRate, audioContext);
    } else if (format === 'mp3') {
      return decodeMP3Format(base64Data, audioContext);
    } else {
      throw new Error(`Unsupported audio format: ${format}. Supported formats: 'pcm', 'mp3'`);
    }
  } catch (error) {
    console.error('Error decoding audio data:', error);
    throw new Error(`Audio decoding failed: ${error.message}`);
  }
}

/**
 * Decode PCM format audio - creates AudioBuffer directly from raw bytes
 * @param {string} base64Data - Base64 encoded PCM data
 * @param {number} sampleRate - Sample rate (e.g., 16000, 24000)
 * @param {AudioContext} audioContext - AudioContext instance
 * @returns {AudioBuffer} Decoded AudioBuffer
 */
export function decodePCMFormat(base64Data, sampleRate, audioContext) {
  try {
    if (!sampleRate || sampleRate <= 0) {
      throw new Error('Valid sample rate is required for PCM decoding');
    }
    
    // Decode base64 to PCM Float32Array
    const pcmData = decodeBase64ToPCM(base64Data);
    
    // Create AudioBuffer directly from PCM data
    const audioBuffer = createAudioBuffer(pcmData, sampleRate, audioContext);
    
    return audioBuffer;
  } catch (error) {
    console.error('Error decoding PCM format:', error);
    throw new Error(`PCM format decoding failed: ${error.message}`);
  }
}

/**
 * Decode MP3 format audio - uses Web Audio API's decodeAudioData
 * @param {string} base64Data - Base64 encoded MP3 data
 * @param {AudioContext} audioContext - AudioContext instance
 * @returns {Promise<AudioBuffer>} Decoded AudioBuffer
 */
export async function decodeMP3Format(base64Data, audioContext) {
  try {
    // Decode base64 to binary string
    const binary = atob(base64Data);
    
    // Convert binary string to ArrayBuffer
    const arrayBuffer = new ArrayBuffer(binary.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    
    for (let i = 0; i < binary.length; i++) {
      uint8Array[i] = binary.charCodeAt(i);
    }
    
    // Use Web Audio API to decode MP3
    try {
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      return audioBuffer;
    } catch (decodeError) {
      console.error('Web Audio API decode error:', decodeError);
      throw new Error(`Failed to decode MP3 audio: ${decodeError.message}`);
    }
  } catch (error) {
    console.error('Error in MP3 format decoding:', error);
    throw new Error(`MP3 format decoding failed: ${error.message}`);
  }
}
