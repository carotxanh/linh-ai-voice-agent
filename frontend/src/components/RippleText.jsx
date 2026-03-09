import { useState, useRef } from 'react'
import './RippleText.css'

export default function RippleText({ children, className = '' }) {
  const [ripples, setRipples] = useState([])
  const containerRef = useRef(null)

  const createRipple = (e) => {
    const container = containerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const newRipple = {
      x,
      y,
      id: Date.now(),
    }

    setRipples((prev) => [...prev, newRipple])

    // Remove ripple after animation
    setTimeout(() => {
      setRipples((prev) => prev.filter((ripple) => ripple.id !== newRipple.id))
    }, 1000)
  }

  return (
    <div
      ref={containerRef}
      className={`ripple-text-container ${className}`}
      onMouseMove={createRipple}
    >
      {children}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
          }}
        />
      ))}
    </div>
  )
}
