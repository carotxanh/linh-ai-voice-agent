import { useEffect, useState } from 'react'
import './AnimatedText.css'

const words = ['khách hàng', 'cuộc gọi']

export default function AnimatedText() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <span className="animated-text-wrapper">
      <span key={currentIndex} className="animated-word active">
        {words[currentIndex]}
      </span>
    </span>
  )
}
