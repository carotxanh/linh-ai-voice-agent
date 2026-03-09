import { useState, useEffect } from 'react'
import { IconCall, IconShield, IconChart, IconScript, IconEmotion } from './Icons'
import { heroRotatingFeatures } from '../data/constants'
import './RotatingFeatureCard.css'

const iconMap = {
  call: IconCall,
  shield: IconShield,
  script: IconScript,
  chart: IconChart,
  emotion: IconEmotion,
}

const iconColors = {
  call: '#ff6b35',
  shield: '#0ea5e9',
  script: '#ec4899',
  chart: '#f59e0b',
  emotion: '#ef4444',
}

export default function RotatingFeatureCard() {
  const [index, setIndex] = useState(0)
  const items = heroRotatingFeatures

  useEffect(() => {
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % items.length)
    }, 4000)
    return () => clearInterval(t)
  }, [items.length])

  const item = items[index]
  const Icon = iconMap[item.icon] || IconCall
  const iconBg = iconColors[item.icon] || iconColors.call

  return (
    <div className="rotating-feature-card-wrap">
      <div className="rotating-feature-card">
        <div key={index} className="rotating-feature-card-inner">
          <span className="rotating-feature-icon" style={{ background: iconBg }}>
            <Icon />
          </span>
          <p className="rotating-feature-text">{item.text}</p>
        </div>
      </div>
      <div className="rotating-feature-bars" aria-hidden>
        {items.map((_, i) => (
          <span
            key={i}
            className={`rotating-feature-bar ${i === index ? 'active' : ''}`}
            style={{ '--bar-color': iconColors[items[i].icon] }}
          />
        ))}
      </div>
    </div>
  )
}
