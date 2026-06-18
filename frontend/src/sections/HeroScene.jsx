import { useState } from 'react'
import { motion as Motion } from 'framer-motion'
import { useConversationControls, useConversationStatus } from '@elevenlabs/react'
import AnimatedText from '../components/AnimatedText'
import SceneWrapper from '../components/SceneWrapper'
import { IconCall } from '../components/Icons'
import { fadeUp } from '../data/animations'
import { getElevenLabsConversationToken } from '../services/voice'

export default function HeroScene({ onCta, onAuth }) {
  const { startSession, endSession } = useConversationControls()
  const { status: conversationStatus } = useConversationStatus()
  const [demoCallStatus, setDemoCallStatus] = useState('idle')
  const [demoCallMessage, setDemoCallMessage] = useState('')
  const badges = ['Trực 24/7', 'Giọng Việt tự nhiên', 'Chuyển người thật khi cần']
  const isDemoBusy = demoCallStatus === 'requesting' || demoCallStatus === 'connecting' || conversationStatus === 'connecting'
  const isDemoConnected = conversationStatus === 'connected'

  const handleDemoCall = async () => {
    if (isDemoConnected) {
      endSession()
      setDemoCallStatus('idle')
      setDemoCallMessage('Đã kết thúc demo.')
      return
    }

    setDemoCallStatus('requesting')
    setDemoCallMessage('')

    try {
      const permissionStream = await navigator.mediaDevices.getUserMedia({ audio: true })
      permissionStream.getTracks().forEach((track) => track.stop())

      const { token } = await getElevenLabsConversationToken()
      setDemoCallStatus('connecting')
      setDemoCallMessage('Đang kết nối demo...')
      startSession({
        conversationToken: token,
        connectionType: 'webrtc',
        onConnect: () => {
          setDemoCallStatus('connected')
          setDemoCallMessage('Demo đang kết nối. Hãy nói thử với agent.')
        },
        onDisconnect: () => {
          setDemoCallStatus('idle')
          setDemoCallMessage('Đã kết thúc demo.')
        },
        onError: (message) => {
          setDemoCallStatus('error')
          setDemoCallMessage(message || 'Không kết nối được ElevenLabs.')
        },
      })
    } catch (error) {
      setDemoCallStatus('error')
      setDemoCallMessage(error.message || 'Chưa mở được demo. Vui lòng kiểm tra ElevenLabs.')
    }
  }

  return (
    <SceneWrapper className="hero-scene justify-center">
      <div className="hero-layout hero-layout-clean mx-auto flex w-full max-w-7xl items-center">
        <div className="hero-copy">
          <Motion.p variants={fadeUp} className="scene-label">
            Nền tảng tự động hóa cuộc gọi AI
          </Motion.p>
          <Motion.h1 variants={fadeUp} className="hero-title hero-title-original">
            <span>LINH</span> là trợ lý AI giúp doanh nghiệp
            <br />
            không bỏ lỡ <AnimatedText /> 24/7
          </Motion.h1>
          <Motion.p variants={fadeUp} className="cinema-subtitle hero-subtitle">
            Tự động hóa xác nhận đặt lịch, cập nhật giao hàng, hỗ trợ khách hàng và follow-up bán hàng bằng giọng nói tự nhiên 24/7.
          </Motion.p>
          <Motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-4">
            <Motion.button className="neon-button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} onClick={onCta}>
              Đặt lịch demo
            </Motion.button>
            <Motion.button className="ghost-button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} onClick={onAuth}>
              Xem luồng hoạt động
            </Motion.button>
          </Motion.div>
          <Motion.div variants={fadeUp} className="demo-call hero-demo-call">
            <Motion.button
              type="button"
              className="demo-call-button"
              whileHover={{ scale: isDemoBusy ? 1 : 1.04 }}
              whileTap={{ scale: isDemoBusy ? 1 : 0.98 }}
              onClick={handleDemoCall}
              disabled={isDemoBusy}
            >
              <span className="demo-call-icon"><IconCall /></span>
              {isDemoConnected ? 'KẾT THÚC DEMO' : isDemoBusy ? 'ĐANG KẾT NỐI...' : 'GỌI DEMO'}
            </Motion.button>
            {demoCallMessage ? (
              <p className={`demo-call-status ${demoCallStatus}`}>
                {demoCallMessage}
              </p>
            ) : null}
          </Motion.div>
          <Motion.div variants={fadeUp} className="mt-7 flex flex-wrap gap-3">
            {badges.map((badge) => (
              <span key={badge} className="hero-badge-pill">
                {badge}
              </span>
            ))}
          </Motion.div>
        </div>
      </div>
    </SceneWrapper>
  )
}
