import { motion as Motion } from 'framer-motion'
import { IconCall, IconChart, IconShield } from '../components/Icons'
import SceneWrapper from '../components/SceneWrapper'
import { fadeUp } from '../data/animations'

const plans = [
  {
    name: 'Gói Khởi Đầu',
    badge: 'Đội nhỏ',
    price: 'Tư vấn theo nhu cầu',
    desc: 'Cho doanh nghiệp muốn tự động hóa cuộc gọi cơ bản và triển khai nhanh.',
    features: ['1 kịch bản cốt lõi', 'Thiết lập dữ liệu ban đầu', 'Báo cáo kết quả cơ bản'],
  },
  {
    name: 'Gói Phát Triển',
    badge: 'Phổ biến',
    price: 'Tối ưu theo quy mô',
    desc: 'Phù hợp đội bán hàng, CSKH hoặc vận hành có nhiều luồng xử lý.',
    features: ['Nhiều kịch bản gọi', 'Dashboard theo dõi chi tiết', 'Tối ưu lời thoại định kỳ'],
  },
  {
    name: 'Gói Doanh Nghiệp',
    badge: 'Quy mô lớn',
    price: 'Thiết kế riêng',
    desc: 'Dành cho hệ thống cần tích hợp riêng, phân quyền và cam kết vận hành.',
    features: ['Tích hợp CRM/ERP', 'SLA và hỗ trợ ưu tiên', 'Bảo mật và phân quyền'],
  },
]

const faqs = [
  'AI có hỗ trợ tiếng Việt tự nhiên không?',
  'Làm thế nào để nạp dữ liệu cho AI?',
  'Có chuyển cuộc gọi cho người thật được không?',
  'Báo cáo sau cuộc gọi gồm những gì?',
]

export default function CTAScene({ onCta }) {
  return (
    <SceneWrapper className="justify-center text-center">
      <div className="pricing-scene mx-auto w-full max-w-6xl">
        <Motion.p variants={fadeUp} className="scene-label">
          Tư vấn gói giá
        </Motion.p>
        <Motion.h2 variants={fadeUp} className="cinema-title cta-title mx-auto max-w-5xl">
          Gói giá linh hoạt cho từng <span className="gradient-text">giai đoạn</span>
        </Motion.h2>
        <Motion.p variants={fadeUp} className="cinema-subtitle mx-auto max-w-2xl">
          Mỗi doanh nghiệp có cách vận hành riêng. Đội ngũ chúng tôi sẽ tư vấn phương án phù hợp với nhu cầu, ngân sách và mục tiêu triển khai của bạn.
        </Motion.p>

        <div className="pricing-grid mt-7">
          {plans.map((plan, index) => (
            <Motion.div variants={fadeUp} key={plan.name} className={`price-card ${index === 1 ? 'featured' : ''}`}>
              <div className="price-card-header">
                <h3>{plan.name}</h3>
                <span className="plan-badge">{plan.badge}</span>
              </div>
              <span className="price-contact">{plan.price}</span>
              <p>{plan.desc}</p>
              <ul className="plan-features">
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <button type="button" onClick={onCta}>Liên hệ ngay</button>
            </Motion.div>
          ))}
        </div>

        <Motion.h3 variants={fadeUp} className="section-mini-title compact">
          Câu hỏi thường gặp
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
            <h3>Trợ lý AI sẵn sàng trở thành tổng đài viên đáng tin cậy của bạn</h3>
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
