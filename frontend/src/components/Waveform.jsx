import { useEffect, useRef } from 'react';
import './Waveform.css';

/**
 * Waveform component - Visual audio activity indicator
 * 
 * @param {Object} props
 * @param {boolean} props.active - Recording state
 * @param {boolean} props.processing - AI speaking state
 * @param {Float32Array} props.audioData - Audio levels
 * @param {number} props.height - Canvas height (default: 64)
 */
const Waveform = ({ active = false, processing = false, audioData = null, height = 64 }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const animationRef = useRef(null);
  const staticBarsRef = useRef([]);
  const processingTimeRef = useRef(0);
  const transitionProgressRef = useRef(0);
  const lastActiveDataRef = useRef([]);

  // Configuration
  const barWidth = 3;
  const barGap = 1;
  const barRadius = 1.5;
  const baseBarHeight = 4;
  const sensitivity = 1;

  // Setup canvas with proper DPI scaling
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      // Set canvas size with DPI scaling
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
    };

    resizeCanvas();

    // Handle window resize
    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Handle processing animation
  useEffect(() => {
    if (processing && !active) {
      transitionProgressRef.current = 0;

      const animateProcessing = () => {
        processingTimeRef.current += 0.03;
        transitionProgressRef.current = Math.min(1, transitionProgressRef.current + 0.02);

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const barCount = Math.floor(rect.width / (barWidth + barGap));
        const halfCount = Math.floor(barCount / 2);
        const processingData = [];

        // Generate symmetric processing animation
        for (let i = 0; i < barCount; i++) {
          const normalizedPosition = (i - halfCount) / halfCount;
          const centerWeight = 1 - Math.abs(normalizedPosition) * 0.4;

          const wave1 = Math.sin(processingTimeRef.current * 1.5 + normalizedPosition * 3) * 0.25;
          const wave2 = Math.sin(processingTimeRef.current * 0.8 - normalizedPosition * 2) * 0.2;
          const wave3 = Math.cos(processingTimeRef.current * 2 + normalizedPosition) * 0.15;
          const combinedWave = wave1 + wave2 + wave3;
          const processingValue = (0.2 + combinedWave) * centerWeight;

          // Smooth transition from last active data
          let finalValue = processingValue;
          if (lastActiveDataRef.current.length > 0 && transitionProgressRef.current < 1) {
            const lastDataIndex = Math.min(i, lastActiveDataRef.current.length - 1);
            const lastValue = lastActiveDataRef.current[lastDataIndex] || 0;
            finalValue = lastValue * (1 - transitionProgressRef.current) + 
                        processingValue * transitionProgressRef.current;
          }

          processingData.push(Math.max(0.05, Math.min(1, finalValue)));
        }

        staticBarsRef.current = processingData;
        animationRef.current = requestAnimationFrame(animateProcessing);
      };

      animateProcessing();

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        }
      };
    } else if (!active && !processing && staticBarsRef.current.length > 0) {
      // Fade to idle
      let fadeProgress = 0;
      const fadeToIdle = () => {
        fadeProgress += 0.03;
        if (fadeProgress < 1) {
          staticBarsRef.current = staticBarsRef.current.map(value => value * (1 - fadeProgress));
          requestAnimationFrame(fadeToIdle);
        } else {
          staticBarsRef.current = [];
        }
      };
      fadeToIdle();
    }
  }, [processing, active]);

  // Main animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      const step = barWidth + barGap;
      const barCount = Math.floor(rect.width / step);
      const centerY = rect.height / 2;

      // Get computed color from CSS
      const computedStyle = getComputedStyle(canvas);
      const barColor = computedStyle.color || '#000';

      if (active && audioData && audioData.length > 0) {
        // Live waveform rendering from audio data
        const halfCount = Math.floor(barCount / 2);
        const newBars = [];

        // Create symmetric display from audio data
        for (let i = 0; i < barCount; i++) {
          const dataIndex = Math.floor((i / barCount) * audioData.length);
          const value = Math.min(1, Math.abs(audioData[dataIndex] || 0) * sensitivity);
          newBars.push(Math.max(0.05, value));
        }

        staticBarsRef.current = newBars;
        lastActiveDataRef.current = newBars;

        // Draw bars
        for (let i = 0; i < barCount && i < newBars.length; i++) {
          const value = newBars[i];
          const x = i * step;
          const barHeight = Math.max(baseBarHeight, value * rect.height * 0.8);
          const y = centerY - barHeight / 2;

          ctx.fillStyle = barColor;
          ctx.globalAlpha = 0.4 + value * 0.6;

          if (barRadius > 0) {
            ctx.beginPath();
            ctx.roundRect(x, y, barWidth, barHeight, barRadius);
            ctx.fill();
          } else {
            ctx.fillRect(x, y, barWidth, barHeight);
          }
        }
      } else if (processing || staticBarsRef.current.length > 0) {
        // Processing animation or fading bars
        const dataToRender = staticBarsRef.current;

        for (let i = 0; i < barCount && i < dataToRender.length; i++) {
          const value = dataToRender[i] || 0.1;
          const x = i * step;
          const barHeight = Math.max(baseBarHeight, value * rect.height * 0.8);
          const y = centerY - barHeight / 2;

          ctx.fillStyle = barColor;
          ctx.globalAlpha = 0.4 + value * 0.6;

          if (barRadius > 0) {
            ctx.beginPath();
            ctx.roundRect(x, y, barWidth, barHeight, barRadius);
            ctx.fill();
          } else {
            ctx.fillRect(x, y, barWidth, barHeight);
          }
        }
      }

      ctx.globalAlpha = 1;
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [active, processing, audioData]);

  return (
    <div 
      className="waveform-container" 
      ref={containerRef}
      style={{ height: `${height}px` }}
      aria-label={active ? "Live audio waveform" : processing ? "Processing audio" : "Audio waveform idle"}
      role="img"
    >
      {/* Idle state: dotted line */}
      {!active && !processing && staticBarsRef.current.length === 0 && (
        <div className="waveform-idle-line" />
      )}
      <canvas
        className="waveform-canvas"
        ref={canvasRef}
        aria-hidden="true"
      />
    </div>
  );
};

export default Waveform;
