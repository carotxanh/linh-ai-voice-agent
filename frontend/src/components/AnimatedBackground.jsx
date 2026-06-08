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
    let particles = []
    let codeDrops = []

    const codeSnippets = ['AI', 'LINH', '24/7', 'CRM', 'VOICE', 'DATA', 'CALL', 'API']

    const resizeCanvas = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight

      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const particleCount = Math.max(72, Math.floor((width * height) / 16000))
      particles = Array.from({ length: particleCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 0.8 + 0.2,
        size: Math.random() * 1.8 + 0.7,
        orbit: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.45 + 0.18,
        hue: Math.random() > 0.45 ? 'cyan' : 'orange',
      }))

      const dropCount = Math.max(18, Math.floor(width / 70))
      codeDrops = Array.from({ length: dropCount }, (_, index) => ({
        x: (index / dropCount) * width + Math.random() * 36,
        y: Math.random() * height,
        speed: Math.random() * 0.6 + 0.35,
        text: codeSnippets[Math.floor(Math.random() * codeSnippets.length)],
        opacity: Math.random() * 0.28 + 0.08,
      }))
    }

    const drawBase = () => {
      const bg = ctx.createLinearGradient(0, 0, 0, height)
      bg.addColorStop(0, '#040713')
      bg.addColorStop(0.44, '#070b16')
      bg.addColorStop(1, '#020307')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, width, height)

      const cyanGlow = ctx.createRadialGradient(width * 0.72, height * 0.26, 0, width * 0.72, height * 0.26, width * 0.5)
      cyanGlow.addColorStop(0, 'rgba(65, 246, 255, 0.16)')
      cyanGlow.addColorStop(0.45, 'rgba(65, 246, 255, 0.06)')
      cyanGlow.addColorStop(1, 'rgba(65, 246, 255, 0)')
      ctx.fillStyle = cyanGlow
      ctx.fillRect(0, 0, width, height)

      const orangeGlow = ctx.createRadialGradient(width * 0.2, height * 0.74, 0, width * 0.2, height * 0.74, width * 0.48)
      orangeGlow.addColorStop(0, 'rgba(255, 122, 26, 0.18)')
      orangeGlow.addColorStop(0.42, 'rgba(255, 122, 26, 0.06)')
      orangeGlow.addColorStop(1, 'rgba(255, 122, 26, 0)')
      ctx.fillStyle = orangeGlow
      ctx.fillRect(0, 0, width, height)
    }

    const drawPerspectiveGrid = () => {
      const horizon = height * 0.58
      const vanishingX = width * 0.5 + Math.sin(time * 0.35) * 80
      ctx.save()
      ctx.globalCompositeOperation = 'screen'
      ctx.lineWidth = 1
      ctx.strokeStyle = 'rgba(65, 246, 255, 0.11)'

      for (let i = -18; i <= 18; i += 1) {
        const bottomX = width * 0.5 + i * 96
        ctx.beginPath()
        ctx.moveTo(vanishingX, horizon)
        ctx.lineTo(bottomX, height + 60)
        ctx.stroke()
      }

      for (let i = 0; i < 30; i += 1) {
        const progress = (i + ((time * 0.7) % 1)) / 30
        const y = horizon + Math.pow(progress, 2.2) * (height - horizon + 120)
        const alpha = 0.02 + progress * 0.16
        ctx.strokeStyle = `rgba(255, 211, 106, ${alpha})`
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }
      ctx.restore()
    }

    const drawParticles = () => {
      ctx.save()
      ctx.globalCompositeOperation = 'screen'
      for (const particle of particles) {
        particle.orbit += 0.006 * particle.speed
        particle.y -= particle.speed * particle.z
        particle.x += Math.sin(particle.orbit + time) * 0.35

        if (particle.y < -20) particle.y = height + 20
        if (particle.x < -20) particle.x = width + 20
        if (particle.x > width + 20) particle.x = -20

        const color = particle.hue === 'cyan' ? '65, 246, 255' : '255, 122, 26'
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size * particle.z, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${color}, ${0.25 + particle.z * 0.42})`
        ctx.fill()

        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size * particle.z * 5, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${color}, ${0.035 + particle.z * 0.035})`
        ctx.fill()
      }
      ctx.restore()
    }

    const drawCodeDrops = () => {
      ctx.save()
      ctx.font = '12px ui-monospace, SFMono-Regular, Consolas, monospace'
      ctx.textAlign = 'center'
      ctx.globalCompositeOperation = 'screen'

      for (const drop of codeDrops) {
        drop.y += drop.speed
        if (drop.y > height + 40) {
          drop.y = -40
          drop.text = codeSnippets[Math.floor(Math.random() * codeSnippets.length)]
        }

        ctx.fillStyle = `rgba(150, 255, 250, ${drop.opacity})`
        ctx.fillText(drop.text, drop.x + Math.sin(time + drop.y * 0.01) * 16, drop.y)
      }
      ctx.restore()
    }

    const animate = () => {
      time += 0.016
      drawBase()
      drawPerspectiveGrid()
      drawParticles()
      drawCodeDrops()
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
