/**
 * Configuration Module
 * Manages environment-based configuration with validation
 * Requirements: 12.1, 12.2, 12.5
 */

/**
 * Default configuration values
 */
const DEFAULT_CONFIG = {
  backendWsUrl: 'ws://localhost:8000/ws/audio-stream',
};

/**
 * Validates a WebSocket URL
 * @param {string} url - URL to validate
 * @returns {boolean} - True if valid
 */
function isValidWebSocketUrl(url) {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'ws:' || urlObj.protocol === 'wss:';
  } catch {
    return false;
  }
}

/**
 * Gets the backend WebSocket URL from environment or default
 * Requirement 12.1: Read from environment variable
 * Requirement 12.2: Provide default fallback
 * Requirement 12.5: Validate configuration
 * @returns {{url: string, error: string|null}} - Configuration object
 */
export function getBackendUrl() {
  // Requirement 12.1: Read from environment variable
  const envUrl = import.meta.env.VITE_BACKEND_WS_URL;

  // If environment variable exists, validate it
  if (envUrl) {
    if (isValidWebSocketUrl(envUrl)) {
      return { url: envUrl, error: null };
    } else {
      // Requirement 12.5: Display configuration errors clearly
      return {
        url: DEFAULT_CONFIG.backendWsUrl,
        error: `Invalid backend URL in environment: "${envUrl}". Using default: ${DEFAULT_CONFIG.backendWsUrl}`,
      };
    }
  }

  // Requirement 12.2: Use default if no environment variable
  return { url: DEFAULT_CONFIG.backendWsUrl, error: null };
}

/**
 * Gets all configuration with validation
 * @returns {{backendWsUrl: string, configError: string|null}} - Complete configuration
 */
export function getConfig() {
  const { url, error } = getBackendUrl();

  return {
    backendWsUrl: url,
    configError: error,
  };
}

/**
 * Validates the entire configuration on startup
 * Requirement 12.5: Validate configuration on startup
 * @returns {{isValid: boolean, errors: string[]}} - Validation result
 */
export function validateConfig() {
  const errors = [];
  const { url, error } = getBackendUrl();

  if (error) {
    errors.push(error);
  }

  if (!isValidWebSocketUrl(url)) {
    errors.push(`Backend URL is invalid: ${url}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export default {
  getBackendUrl,
  getConfig,
  validateConfig,
};
