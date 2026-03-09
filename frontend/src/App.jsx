import { useState } from 'react'
import { useConversation } from '@elevenlabs/react'
import AnimatedBackground from './components/AnimatedBackground'
import Header from './components/Header'
import Footer from './components/Footer'
import LoginModal from './components/LoginModal'
import HeroSection from './sections/HeroSection'
import FeaturesSection from './sections/FeaturesSection'
import TestimonialsSection from './sections/TestimonialsSection'
import ProcessSection from './sections/ProcessSection'
import IndustriesSection from './sections/IndustriesSection'
import ProofSection from './sections/ProofSection'
import { BACKEND_URL } from './data/constants'
import './index.css'

function App() {
  const [showLogin, setShowLogin] = useState(false)
  const [voiceConnecting, setVoiceConnecting] = useState(false)

  const conversation = useConversation({
    onConnect: () => {
      console.log('ElevenLabs Agent connected')
      setVoiceConnecting(false)
    },
    onDisconnect: () => {
      console.log('ElevenLabs Agent disconnected')
      setVoiceConnecting(false)
    },
    onError: (error) => {
      console.error('ElevenLabs Agent error:', error)
      setVoiceConnecting(false)
    },
    onMessage: (message) => {
      console.log('Agent message:', message)
    },
  })

  const handleVoiceClick = async () => {
    if (voiceConnecting) return

    if (conversation.status === 'connected') {
      await conversation.endSession()
      return
    }

    try {
      setVoiceConnecting(true)
      await navigator.mediaDevices.getUserMedia({ audio: true })

      const response = await fetch(`${BACKEND_URL}/api/signed-url`)
      if (!response.ok) {
        throw new Error('Không thể lấy signed URL từ server')
      }
      const data = await response.json()

      await conversation.startSession({
        signedUrl: data.signed_url,
      })
    } catch (error) {
      console.error('Lỗi kết nối voice agent:', error)
      setVoiceConnecting(false)
      alert('Không thể kết nối voice agent. Vui lòng thử lại.')
    }
  }

  return (
    <div className="page-shell">
      <AnimatedBackground />
      <Header onLoginClick={() => setShowLogin(true)} />

      <main>
        <HeroSection
          conversation={conversation}
          voiceConnecting={voiceConnecting}
          onVoiceClick={handleVoiceClick}
          onLoginClick={() => setShowLogin(true)}
        />

        <FeaturesSection />
        <TestimonialsSection />
        <ProcessSection />
        <IndustriesSection />
        <ProofSection />
      </main>

      <Footer />

      <LoginModal show={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  )
}

export default App
