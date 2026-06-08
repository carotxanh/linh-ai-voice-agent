import AnimatedText from '../components/AnimatedText'
import HeroRippleEffect from '../components/HeroRippleEffect'
import { IconSpark } from '../components/Icons'

export default function HeroSection({ onLoginClick }) {
  return (
    <section className="hero section hero-full" id="hero" style={{ position: 'relative' }}>
      <HeroRippleEffect />

      <div className="hero-code-orbit" aria-hidden="true">
        <span>const linh = voice.ai()</span>
        <span>listen_24_7()</span>
        <span>no_missed_customers</span>
        <span>deploy.agent()</span>
      </div>

      <div className="hero-badge">
        <span className="icon-wrap small"><IconSpark /></span>
        #1 AI Voice Agent cho doanh nghiệp Việt
      </div>

      <div className="hero-content">
        <div className="hero-copy">
          <h1>
            <span className="hero-brand">LINH</span> là trợ lý AI giúp doanh nghiệp
            <br />
            không bỏ lỡ <AnimatedText /> 24/7
          </h1>
          <p>
            Tự động hóa tổng đài chăm sóc khách hàng, tư vấn và xử lý đơn hàng bằng giọng nói tự nhiên như người thật.
            Web hiện chỉ mở hai luồng chính: đăng nhập và đăng ký tài khoản.
          </p>

          <div className="hero-actions">
            <button className="btn btn-primary" onClick={onLoginClick}>
              Đăng nhập
            </button>
            <button className="btn btn-secondary" onClick={onLoginClick}>
              Đăng ký tài khoản
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
