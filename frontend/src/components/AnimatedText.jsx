import { useState, useEffect } from 'react'
import './AnimatedText.css'

export default function AnimatedText() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const words = ['khách hàng', 'cuộc gọi']

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length)
    }, 1000) // Thay đổi mỗi 1 giây

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
