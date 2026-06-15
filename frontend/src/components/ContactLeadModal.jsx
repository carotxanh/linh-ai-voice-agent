import { useEffect, useState } from 'react'
import { motion as Motion } from 'framer-motion'
import { IconCall, IconHeadset, IconShield } from './Icons'
import { submitContactLead } from '../services/contact'

const hotline = '038 916 6569'

const initialFormData = {
  fullName: '',
  email: '',
  phone: '',
  companyName: '',
  businessNeed: '',
  preferredContactTime: '',
  message: '',
}

const needOptions = [
  'CSKH, xác nhận lịch, bán hàng',
  'Tổng đài chăm sóc khách hàng',
  'Tư vấn và chốt lịch hẹn',
  'Theo dõi lead và nhắc lịch',
  'Tích hợp CRM/ERP',
]

const industryOptions = [
  'Bán lẻ',
  'Ngân hàng',
  'Sản xuất',
  'Logistics',
  'Bất động sản',
  'Y tế / Phòng khám',
  'Spa / Làm đẹp',
  'TMĐT',
  'Giáo dục / Tuyển sinh',
  'Nhà hàng / Khách sạn',
  'Tài chính / Bảo hiểm',
  'Ô tô',
  'Du lịch',
  'SaaS / Công nghệ',
  'Dịch vụ khác',
]

function FieldIcon({ type }) {
  const icons = {
    user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7 9a7 7 0 0 0-14 0',
    mail: 'M4 6h16v12H4V6Zm0 1 8 6 8-6',
    phone: 'M6.6 10.8a15.2 15.2 0 0 0 6.6 6.6l2.2-2.2c.3-.3.8-.4 1.2-.3 1 .3 2 .4 3 .4.7 0 1.2.5 1.2 1.2V20c0 .7-.5 1.2-1.2 1.2C10 21.2 2.8 14 2.8 5.2 2.8 4.5 3.3 4 4 4h3.5c.7 0 1.2.5 1.2 1.2 0 1 .1 2 .4 3 .1.4 0 .9-.3 1.2l-2.2 2.4Z',
    building: 'M4 21V5h10v16M14 9h6v12M7 8h2M7 12h2M7 16h2M17 13h1M17 17h1',
    briefcase: 'M9 7V5h6v2M4 8h16v12H4V8Zm0 5h16',
    clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13v5l3 2',
    edit: 'M4 20h4l11-11-4-4L4 16v4Zm12-16 4 4',
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={icons[type]} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const trackLeadFormSubmit = () => {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return

  window.gtag('event', 'lead_form_submit', {
    form_name: 'consultation_form',
    page_type: 'landing_page',
  })
}

export default function ContactLeadModal({ show, onClose }) {
  const [formData, setFormData] = useState(initialFormData)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState({ type: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!show) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.body.classList.add('modal-open')
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.classList.remove('modal-open')
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [show, onClose])

  if (!show) return null

  const validateForm = () => {
    const nextErrors = {}
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const phonePattern = /^\+?[0-9().\-\s]{8,20}$/

    if (formData.fullName.trim().length < 2) nextErrors.fullName = 'Vui lòng nhập họ tên.'
    if (!emailPattern.test(formData.email.trim())) nextErrors.email = 'Email chưa đúng định dạng.'
    if (!phonePattern.test(formData.phone.trim())) nextErrors.phone = 'Số điện thoại cần từ 8-20 chữ số/ký tự hợp lệ.'
    if (formData.companyName.trim().length < 2) nextErrors.companyName = 'Vui lòng nhập tên doanh nghiệp.'
    if (formData.businessNeed.trim().length < 5) nextErrors.businessNeed = 'Vui lòng chọn mục tiêu triển khai.'
    if (formData.preferredContactTime.trim().length < 2) nextErrors.preferredContactTime = 'Vui lòng chọn ngành nghề.'
    if (formData.message.trim().length < 10) nextErrors.message = 'Nhu cầu chính cần ít nhất 10 ký tự.'
    if (formData.message.trim().length > 500) nextErrors.message = 'Nhu cầu chính tối đa 500 ký tự.'

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: '' }))
    setStatus({ type: '', message: '' })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    setStatus({ type: '', message: '' })

    try {
      const result = await submitContactLead({
        full_name: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        company_name: formData.companyName.trim(),
        business_need: formData.businessNeed.trim(),
        preferred_contact_time: formData.preferredContactTime.trim(),
        message: formData.message.trim(),
      })

      trackLeadFormSubmit()
      setFormData(initialFormData)
      setStatus({
        type: 'success',
        message: result.email_sent
          ? 'Đã nhận thông tin và gửi email cho đội LinhVoice.'
          : 'Đã lưu thông tin. Đội LinhVoice sẽ kiểm tra và liên hệ lại.',
      })
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.message || 'Chưa gửi được thông tin, vui lòng thử lại.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="contact-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="contact-modal-title">
      <Motion.div
        className="contact-modal-shell"
        initial={{ opacity: 0, scale: 0.96, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
      >
        <button type="button" className="contact-modal-close" onClick={onClose} aria-label="Đóng form liên hệ">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <aside className="contact-modal-info">
          <div className="contact-shield-visual" aria-hidden="true">
            <div className="shield-orbit one" />
            <div className="shield-orbit two" />
            <IconShield />
          </div>

          <span className="contact-trust-pill">
            <IconShield />
            Không cần tuyển thêm ca trực
          </span>

          <h2>
            Để lại thông tin, chúng tôi sẽ <span>trao đổi với bạn</span>
          </h2>
          <p>LinhVoice sẽ dựa trên nhu cầu, quy mô và ngành nghề để tư vấn demo phù hợp.</p>

          <div className="contact-benefit-grid">
            <div>
              <strong>24/7</strong>
              <span>Phục vụ liên tục</span>
            </div>
            <div>
              <IconHeadset />
              <strong>Tư vấn theo nhu cầu</strong>
              <span>Giải pháp phù hợp</span>
            </div>
            <div>
              <strong>Nhanh</strong>
              <span>Đội ngũ hỗ trợ</span>
            </div>
          </div>
        </aside>

        <section className="contact-modal-form-card">
          <div className="contact-form-heading">
            <span aria-hidden="true">
              <FieldIcon type="mail" />
            </span>
            <div>
              <h3 id="contact-modal-title">Thông tin liên hệ</h3>
              <p>Vui lòng điền thông tin để chúng tôi liên hệ và tư vấn chi tiết.</p>
            </div>
          </div>

          <form className="contact-modal-form" onSubmit={handleSubmit} noValidate>
            <label>
              <span>Họ và tên *</span>
              <div className={`contact-input-wrap ${errors.fullName ? 'input-error' : ''}`}>
                <FieldIcon type="user" />
                <input type="text" value={formData.fullName} onChange={(event) => updateField('fullName', event.target.value)} autoComplete="name" placeholder="Nguyễn Văn A" />
              </div>
              {errors.fullName && <small>{errors.fullName}</small>}
            </label>

            <label>
              <span>Email *</span>
              <div className={`contact-input-wrap ${errors.email ? 'input-error' : ''}`}>
                <FieldIcon type="mail" />
                <input type="email" value={formData.email} onChange={(event) => updateField('email', event.target.value)} autoComplete="email" placeholder="ban@congty.com" />
              </div>
              {errors.email && <small>{errors.email}</small>}
            </label>

            <label>
              <span>Số điện thoại *</span>
              <div className={`contact-input-wrap ${errors.phone ? 'input-error' : ''}`}>
                <FieldIcon type="phone" />
                <input type="tel" value={formData.phone} onChange={(event) => updateField('phone', event.target.value)} autoComplete="tel" placeholder="0901234567" />
              </div>
              {errors.phone && <small>{errors.phone}</small>}
            </label>

            <label>
              <span>Doanh nghiệp *</span>
              <div className={`contact-input-wrap ${errors.companyName ? 'input-error' : ''}`}>
                <FieldIcon type="building" />
                <input type="text" value={formData.companyName} onChange={(event) => updateField('companyName', event.target.value)} autoComplete="organization" placeholder="Tên công ty / cửa hàng" />
              </div>
              {errors.companyName && <small>{errors.companyName}</small>}
            </label>

            <label>
              <span>Mục tiêu triển khai *</span>
              <div className={`contact-input-wrap ${errors.businessNeed ? 'input-error' : ''}`}>
                <FieldIcon type="briefcase" />
                <select value={formData.businessNeed} onChange={(event) => updateField('businessNeed', event.target.value)}>
                  <option value="">CSKH, xác nhận lịch, bán hàng...</option>
                  {needOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              {errors.businessNeed && <small>{errors.businessNeed}</small>}
            </label>

            <label>
              <span>Ngành nghề *</span>
              <div className={`contact-input-wrap ${errors.preferredContactTime ? 'input-error' : ''}`}>
                <FieldIcon type="building" />
                <select value={formData.preferredContactTime} onChange={(event) => updateField('preferredContactTime', event.target.value)}>
                  <option value="">Chọn ngành nghề của bạn</option>
                  {industryOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              {errors.preferredContactTime && <small>{errors.preferredContactTime}</small>}
            </label>

            <label className="contact-modal-wide">
              <span>Nhu cầu chính *</span>
              <div className={`contact-input-wrap textarea ${errors.message ? 'input-error' : ''}`}>
                <FieldIcon type="edit" />
                <textarea value={formData.message} onChange={(event) => updateField('message', event.target.value)} rows="4" maxLength="500" placeholder="Chia sẻ nhu cầu chính, số lượng cuộc gọi, quy trình hiện tại hoặc mong muốn của bạn." />
                <em>{formData.message.length}/500</em>
              </div>
              {errors.message && <small>{errors.message}</small>}
            </label>

            <p className="contact-privacy-note">
              <IconShield />
              Thông tin của bạn được bảo mật tuyệt đối và chỉ dùng để liên hệ tư vấn.
            </p>

            {status.message && <p className={`contact-status ${status.type}`}>{status.message}</p>}

            <Motion.button type="submit" className="contact-modal-submit" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} disabled={isSubmitting}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M21 3 10 14M21 3l-7 18-4-7-7-4 18-7Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {isSubmitting ? 'Đang gửi...' : 'Gửi thông tin'}
            </Motion.button>
          </form>

          <div className="contact-hotline">
            <span><IconCall /></span>
            <p>Hoặc liên hệ nhanh qua hotline</p>
            <strong>{hotline}</strong>
            <i>Hỗ trợ 24/7</i>
          </div>
        </section>
      </Motion.div>
    </div>
  )
}
