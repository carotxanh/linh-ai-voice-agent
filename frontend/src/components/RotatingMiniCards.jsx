import { useState, useEffect } from 'react'
import './RotatingMiniCards.css'

export default function RotatingMiniCards() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const features = [
    {
      icon: '📞',
      label: 'Đang gọi thử',
      title: '12 cuộc gọi với khách hàng',
      color: 'orange'
    },
    {
      icon: '📖',
      label: 'Đang học hỏi',
      title: 'Thông tin website, tài liệu của Sếp',
      color: 'orange'
    },
    {
      icon: '💡',
      label: 'Đang tự đề xuất',
      title: '3 cải tiến phản hồi',
      color: 'yellow'
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % features.length)
    }, 3000) // Thay đổi mỗi 3 giây

    return () => clearInterval(interval)
  }, [features.length])

  return (
    <div className="rotating-mini-cards">
      {features.map((feature, index) => (
        <div
          key={index}
          className={`rotating-card ${index === currentIndex ? 'active' : ''} rotating-card-${feature.color}`}
        >
          <div className="rotating-card-icon">
            <span>{feature.icon}</span>
          </div>
          <div className="rotating-card-content">
            <span className="rotating-card-label">{feature.label}</span>
            <strong className="rotating-card-title">{feature.title}</strong>
          </div>
        </div>
      ))}
    </div>
  )
}
