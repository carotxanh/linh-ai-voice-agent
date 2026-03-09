import { useState, useRef, useEffect } from 'react'
import './HeroRippleEffect.css'

export default function HeroRippleEffect() {
  const [ripples, setRipples] = useState([])
  const containerRef = useRef(null)

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Check if mouse is within hero section
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        if (
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        ) {
          const newRipple = {
            x: e.clientX,
            y: e.clientY,
            id: Date.now() + Math.random(),
          }

          setRipples((prev) => [...prev, newRipple])

          // Remove ripple after animation
          setTimeout(() => {
            setRipples((prev) => prev.filter((ripple) => ripple.id !== newRipple.id))
          }, 1000)
        }
      }
    }

    document.addEventListener('mousemove', handleMouseMove)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <>
      <div ref={containerRef} className="hero-ripple-boundary" />
      <div className="hero-ripple-portal">
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="hero-ripple"
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
