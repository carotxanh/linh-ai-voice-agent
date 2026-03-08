import '@testing-library/jest-dom'

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {
    // Mock observe
  }
  unobserve() {
    // Mock unobserve
  }
  disconnect() {
    // Mock disconnect
  }
};

// Mock requestAnimationFrame and cancelAnimationFrame
global.requestAnimationFrame = (callback) => {
  return setTimeout(callback, 0);
};

global.cancelAnimationFrame = (id) => {
  clearTimeout(id);
};

// Mock HTMLCanvasElement.getContext
HTMLCanvasElement.prototype.getContext = function(contextType) {
  if (contextType === '2d') {
    return {
      fillStyle: '',
      strokeStyle: '',
      globalAlpha: 1,
      lineWidth: 1,
      clearRect: () => {},
      fillRect: () => {},
      strokeRect: () => {},
      beginPath: () => {},
      closePath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      arc: () => {},
      fill: () => {},
      stroke: () => {},
      scale: () => {},
      translate: () => {},
      rotate: () => {},
      save: () => {},
      restore: () => {},
      roundRect: () => {},
      createLinearGradient: () => ({
        addColorStop: () => {}
      }),
      measureText: () => ({ width: 0 })
    };
  }
  return null;
};
