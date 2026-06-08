import { motion as Motion } from 'framer-motion'
import AnimatedText from '../components/AnimatedText'
import SceneWrapper from '../components/SceneWrapper'
import { fadeUp } from '../data/animations'

export default function HeroScene({ onCta }) {
  const badges = ['Trực 24/7', 'Giọng Việt tự nhiên', 'Chuyển người thật khi cần']

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
            <Motion.button className="ghost-button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} onClick={onCta}>
              Xem luồng hoạt động
            </Motion.button>
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
