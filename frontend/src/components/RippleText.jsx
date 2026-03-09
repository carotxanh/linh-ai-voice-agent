import { useState, useRef } from 'react'
import './RippleText.css'

export default function RippleText({ children, className = '' }) {
  const [ripples, setRipples] = useState([])
  const containerRef = useRef(null)
  const [isHovering, setIsHovering] = useState(false)

  const createRipple = (e) => {
    if (!isHovering) return

    // Use viewport coordinates
    const x = e.clientX
    const y = e.clientY

    const newRipple = {
      x,
      y,
      id: Date.now() + Math.random(),
    }

    setRipples((prev) => [...prev, newRipple])

    // Remove ripple after animation
    setTimeout(() => {
      setRipples((prev) => prev.filter((ripple) => ripple.id !== newRipple.id))
    }, 1000)
  }

  return (
    <>
      <div
        ref={containerRef}
        className={`ripple-text-container ${className}`}
        onMouseMove={createRipple}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {children}
      </div>
      
      {/* Render ripples in a fixed portal */}
      <div className="ripple-portal">
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="ripple ripple-fullscreen"
            style={{
              left: ripple.x,
              top: ripple.y,
            }}
          />
        ))}
      </div>
    </>
  )
}
