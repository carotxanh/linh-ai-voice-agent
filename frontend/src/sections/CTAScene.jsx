import { motion as Motion } from 'framer-motion'
import { IconCall, IconChart, IconShield } from '../components/Icons'
import SceneWrapper from '../components/SceneWrapper'
import { fadeUp } from '../data/animations'

const plans = [
  { name: 'Starter', price: '1.200.000đ', desc: 'Cho đội nhỏ cần tự động hóa cuộc gọi cơ bản.' },
  { name: 'Growth', price: '5.500.000đ', desc: 'Cho doanh nghiệp có nhiều kịch bản và báo cáo.' },
  { name: 'Enterprise', price: '10.000.000đ+', desc: 'Cho vận hành lớn, tích hợp riêng và SLA.' },
]

const faqs = [
  'Em có hỗ trợ tiếng Việt tự nhiên không?',
  'Làm thế nào để nạp dữ liệu cho AI?',
  'Có chuyển cuộc gọi cho người thật được không?',
  'Báo cáo sau cuộc gọi gồm những gì?',
]

export default function CTAScene({ onCta }) {
  return (
    <SceneWrapper className="justify-center text-center">
      <div className="pricing-scene mx-auto w-full max-w-6xl">
        <Motion.p variants={fadeUp} className="scene-label">
          Giá cả rõ ràng
        </Motion.p>
        <Motion.h2 variants={fadeUp} className="cinema-title cta-title mx-auto max-w-5xl">
          Giá của em rất <span className="gradient-text">thời đại</span>
        </Motion.h2>

        <div className="pricing-grid mt-7">
          {plans.map((plan, index) => (
            <Motion.div variants={fadeUp} key={plan.name} className={`price-card ${index === 1 ? 'featured' : ''}`}>
              <h3>{plan.name}</h3>
              <strong>{plan.price}</strong>
              <p>{plan.desc}</p>
              <button type="button" onClick={onCta}>Đăng ký ngay</button>
            </Motion.div>
          ))}
        </div>

        <Motion.h3 variants={fadeUp} className="section-mini-title compact">
          Các thắc mắc về em
        </Motion.h3>
        <Motion.div variants={fadeUp} className="faq-list">
          {faqs.map((faq) => (
            <button key={faq} type="button">
              {faq}
              <span>+</span>
            </button>
          ))}
        </Motion.div>

        <Motion.div variants={fadeUp} className="final-cta-band">
          <div>
            <span><IconShield /> Không cần tuyển thêm ca trực</span>
            <h3>Em hứa sẽ trở thành nhân viên tổng đài số 1 của bạn</h3>
          </div>
          <Motion.button className="neon-button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} onClick={onCta}>
            <IconCall />
            Bắt đầu demo
          </Motion.button>
          <span className="band-metric"><IconChart /> 24/7</span>
        </Motion.div>
      </div>
    </SceneWrapper>
  )
}
