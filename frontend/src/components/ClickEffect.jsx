import { useState, useEffect } from 'react'
import './ClickEffect.css'

export default function ClickEffect() {
  const [effects, setEffects] = useState([])

  useEffect(() => {
    const handleClick = (e) => {
      // Don't trigger on buttons, links, or interactive elements
      if (
        e.target.tagName === 'BUTTON' ||
        e.target.tagName === 'A' ||
        e.target.tagName === 'INPUT' ||
        e.target.closest('button') ||
        e.target.closest('a')
      ) {
        return
      }

      const newEffect = {
        x: e.clientX,
        y: e.clientY,
        id: Date.now() + Math.random(),
      }

      setEffects((prev) => [...prev, newEffect])

      // Remove effect after animation
      setTimeout(() => {
        setEffects((prev) => prev.filter((effect) => effect.id !== newEffect.id))
      }, 1500)
    }

    document.addEventListener('click', handleClick)

    return () => {
      document.removeEventListener('click', handleClick)
    }
  }, [])

  return (
    <div className="click-effects-container">
      {effects.map((effect) => (
        <div
          key={effect.id}
          className="click-effect"
          style={{
            left: effect.x,
            top: effect.y,
          }}
        >
          {/* Water droplet ripples */}
          <div className="droplet-ring ring-1"></div>
          <div className="droplet-ring ring-2"></div>
          <div className="droplet-ring ring-3"></div>
          
          {/* Water splash particles */}
          <div className="splash-particle particle-1"></div>
          <div className="splash-particle particle-2"></div>
          <div className="splash-particle particle-3"></div>
          <div className="splash-particle particle-4"></div>
          <div className="splash-particle particle-5"></div>
          <div className="splash-particle particle-6"></div>
        </div>
      ))}
    </div>
  )
}
