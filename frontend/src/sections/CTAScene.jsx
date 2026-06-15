import { useState } from 'react'
import { motion as Motion } from 'framer-motion'
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
  {
    question: 'AI có hỗ trợ tiếng Việt tự nhiên không?',
    answer: 'Có. LinhVoice được thiết kế cho hội thoại tiếng Việt, có thể xử lý cách nói tự nhiên, ngắt câu, xác nhận thông tin và phản hồi theo kịch bản của doanh nghiệp.',
  },
  {
    question: 'Làm thế nào để nạp dữ liệu cho AI?',
    answer: 'Bạn có thể tải lên tài liệu, FAQ, bảng giá, chính sách hoặc quy trình bán hàng. Đội triển khai sẽ chuẩn hóa dữ liệu và kiểm thử để AI trả lời nhất quán.',
  },
  {
    question: 'Có chuyển cuộc gọi cho người thật được không?',
    answer: 'Có. Khi khách cần hỗ trợ chuyên sâu hoặc gặp tình huống ngoài kịch bản, AI có thể ghi nhận ngữ cảnh và chuyển tiếp cho nhân sự phụ trách.',
  },
  {
    question: 'Báo cáo sau cuộc gọi gồm những gì?',
    answer: 'Báo cáo có thể gồm tóm tắt nội dung, trạng thái khách hàng, nhu cầu chính, kết quả cuộc gọi, thời lượng, chi phí và transcript để đội ngũ theo dõi lại.',
  },
]

export default function CTAScene({ onCta }) {
  const [openFaq, setOpenFaq] = useState(0)

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
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index

            return (
              <div key={faq.question} className={`faq-item ${isOpen ? 'open' : ''}`}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                  onClick={() => setOpenFaq((current) => (current === index ? -1 : index))}
                >
                  {faq.question}
                  <span aria-hidden="true">{isOpen ? '−' : '+'}</span>
                </button>
                <div id={`faq-answer-${index}`} className="faq-answer" hidden={!isOpen}>
                  <p>{faq.answer}</p>
                </div>
              </div>
            )
          })}
        </Motion.div>
      </div>
    </SceneWrapper>
  )
}
