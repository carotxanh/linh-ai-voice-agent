import RippleText from '../components/RippleText'
import AnimatedText from '../components/AnimatedText'
import { IconSpark } from '../components/Icons'
import VoiceAgent from '../components/VoiceAgent'
import RotatingMiniCards from '../components/RotatingMiniCards'

export default function HeroSection({ 
  conversation, 
  voiceConnecting, 
  onVoiceClick, 
  onLoginClick 
}) {
  return (
    <section className="hero section" id="hero">
      <div className="hero-badge">
        <span className="icon-wrap small"><IconSpark /></span>
        AI Voice Agent cho doanh nghiệp Việt
      </div>

      <div className="hero-content">
        <div className="hero-copy">
          <RippleText>
            <h1>
              <span className="hero-brand">LINH</span> là trợ lý AI giúp doanh nghiệp
              <br />
              không bỏ lỡ <AnimatedText /> 24/7
            </h1>
          </RippleText>
          <p></p>

          <div className="hero-actions">
            <button className="btn btn-primary" onClick={onLoginClick}>
              Thử em ngay
            </button>
            <a className="btn btn-secondary" href="#tinh-nang">
              Khám phá tính năng
            </a>
          </div>
        </div>

        <div className="hero-panel glass-card">
          <RotatingMiniCards />

          <VoiceAgent
            conversation={conversation}
            voiceConnecting={voiceConnecting}
            onVoiceClick={onVoiceClick}
          />
        </div>
      </div>
    </section>
  )
}
