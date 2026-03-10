import { useEffect, useRef } from 'react'
import './AnimatedBackground.css'

export default function AnimatedBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId
    let time = 0
    let width = 0
    let height = 0
    let dpr = Math.min(window.devicePixelRatio || 1, 2)

    const waves = [
      {
        amplitude: 22,
        frequency: 0.012,
        speed: 0.7,
        offset: 0,
        baseOffset: -10,
      },
      {
        amplitude: 28,
        frequency: 0.015,
        speed: 0.5,
        offset: 1.5,
        baseOffset: 8,
      },
      {
        amplitude: 20,
        frequency: 0.018,
        speed: 0.9,
        offset: 3,
        baseOffset: 18,
      },
    ]

    let particles = []

    const createParticles = () => {
      const count = Math.max(40, Math.floor((width * height) / 35000))
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.8 + 0.6,
        speedX: (Math.random() - 0.5) * 0.12,
        speedY: (Math.random() - 0.5) * 0.12,
        opacity: Math.random() * 0.55 + 0.2,
      }))
    }

    const resizeCanvas = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight

      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      createParticles()
    }

    const drawBackground = () => {
      const bg = ctx.createLinearGradient(0, 0, 0, height)
      bg.addColorStop(0, '#1a1d21')
      bg.addColorStop(0.42, '#161a1f')
      bg.addColorStop(0.72, '#112033')
      bg.addColorStop(1, '#09172b')

      ctx.fillStyle = bg
      ctx.fillRect(0, 0, width, height)

      // thêm lớp sáng nhẹ giữa màn hình
      const glow = ctx.createRadialGradient(
        width * 0.5,
        height * 0.58,
        0,
        width * 0.5,
        height * 0.58,
        Math.max(width, height) * 0.55
      )
      glow.addColorStop(0, 'rgba(90, 120, 160, 0.08)')
      glow.addColorStop(0.45, 'rgba(50, 75, 110, 0.05)')
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)')

      ctx.fillStyle = glow
      ctx.fillRect(0, 0, width, height)
    }

    const drawParticles = () => {
      for (const particle of particles) {
        particle.x += particle.speedX
        particle.y += particle.speedY

        if (particle.x < -10) particle.x = width + 10
        if (particle.x > width + 10) particle.x = -10
        if (particle.y < -10) particle.y = height + 10
        if (particle.y > height + 10) particle.y = -10

        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(240, 246, 255, ${particle.opacity})`
        ctx.fill()

        if (particle.radius > 1.5) {
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.radius * 3.2, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(210, 228, 255, ${particle.opacity * 0.18})`
          ctx.fill()

          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.radius * 5.4, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(185, 210, 245, ${particle.opacity * 0.08})`
          ctx.fill()
        }
      }
    }

    const drawWaveLayer = (wave, index) => {
      const baseY = height * 0.53 + wave.baseOffset

      ctx.beginPath()
      ctx.moveTo(0, height)

      for (let x = 0; x <= width; x += 4) {
        const y =
          baseY +
          Math.sin(x * wave.frequency + time * wave.speed + wave.offset) * wave.amplitude +
          Math.sin(x * wave.frequency * 0.45 + time * wave.speed * 0.65 + wave.offset) * 6

        ctx.lineTo(x, y)
      }

      ctx.lineTo(width, height)
      ctx.closePath()

      const gradient = ctx.createLinearGradient(0, height * 0.4, 0, height)

      if (index === 0) {
        // sóng sáng nhất: trắng xanh sương
        gradient.addColorStop(0, 'rgba(220, 230, 242, 0.22)')
        gradient.addColorStop(0.35, 'rgba(165, 180, 198, 0.18)')
        gradient.addColorStop(0.68, 'rgba(95, 115, 138, 0.11)')
        gradient.addColorStop(1, 'rgba(36, 52, 70, 0.04)')
      } else if (index === 1) {
        // sóng xanh xám lạnh
        gradient.addColorStop(0, 'rgba(155, 170, 188, 0.17)')
        gradient.addColorStop(0.4, 'rgba(102, 120, 142, 0.14)')
        gradient.addColorStop(0.72, 'rgba(58, 75, 96, 0.09)')
        gradient.addColorStop(1, 'rgba(28, 38, 52, 0.04)')
      } else {
        // sóng pha nâu cam nhẹ
        gradient.addColorStop(0, 'rgba(150, 112, 96, 0.14)')
        gradient.addColorStop(0.42, 'rgba(105, 86, 84, 0.11)')
        gradient.addColorStop(0.74, 'rgba(56, 57, 70, 0.07)')
        gradient.addColorStop(1, 'rgba(22, 28, 38, 0.03)')
      }

      ctx.fillStyle = gradient
      ctx.fill()
    }

    const animate = () => {
      time += 0.016

      drawBackground()
      drawParticles()

      ctx.save()
      ctx.globalCompositeOperation = 'screen'
      waves.forEach((wave, index) => drawWaveLayer(wave, index))
      ctx.restore()

      animationFrameId = requestAnimationFrame(animate)
    }

    resizeCanvas()
    animate()

    window.addEventListener('resize', resizeCanvas)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return <canvas ref={canvasRef} className="animated-background" />
}