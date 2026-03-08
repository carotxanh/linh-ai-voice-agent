import { useState } from 'react'
import { useConversation } from '@elevenlabs/react'
import './index.css'

const stats = [
  { label: 'Cuộc gọi đồng thời', value: '12+' },
  { label: 'Tỷ lệ phản hồi', value: '24/7' },
  { label: 'Tăng hiệu suất', value: '60%' },
]

const testimonials = [
  {
    name: 'Anh Tuấn',
    role: 'Manager bán lẻ',
    quote:
      'LINH giúp team không bỏ lỡ khách hàng ngoài giờ, đồng thời trả lời tự nhiên và rõ ràng hơn hẳn chatbot thông thường.',
    reply: 'Đã ghi nhận và chuyển đúng nhu cầu cho đội ngũ ạ.',
  },
  {
    name: 'Chị Lan',
    role: 'Chủ cửa hàng',
    quote:
      'Khách gọi đặt lịch liên tục nhưng hệ thống vẫn phản hồi ổn định, giúp mình đỡ áp lực tuyển thêm người.',
    reply: 'LINH luôn sẵn sàng hỗ trợ 24/7.',
  },
  {
    name: 'Anh Minh',
    role: 'Trưởng nhóm CSKH',
    quote:
      'Điểm mình thích nhất là báo cáo nhanh, dễ hiểu và có thể bám theo quy trình nghiệp vụ của doanh nghiệp.',
    reply: 'Báo cáo đã được gửi sau mỗi cuộc gọi.',
  },
  {
    name: 'Chị Hạnh',
    role: 'Quản lý vận hành',
    quote:
      'Giọng nói nghe gần gũi, không bị máy móc. Khách hàng hợp tác hơn khi cần xác nhận đơn hoặc lịch hẹn.',
    reply: 'LINH có thể chuyển tiếp nhân sự khi khách yêu cầu.',
  },
]

const features = [
  {
    title: '24/7 không bỏ lỡ khách hàng',
    desc: 'Tự động tiếp nhận cuộc gọi đến, phản hồi nhanh, hỗ trợ mọi khung giờ mà không phụ thuộc ca trực.',
  },
  {
    title: 'Tối ưu chi phí vận hành',
    desc: 'Giảm tải cho telesales và chăm sóc khách hàng bằng các luồng xử lý lặp lại, đúng với pain point trong bài EXE.',
  },
  {
    title: 'Tích hợp quy trình nội bộ',
    desc: 'Có thể gắn với CRM, ticket, bảng giá, quy trình xác nhận đơn hoặc lịch hẹn để tư vấn nhất quán.',
  },
  {
    title: 'Báo cáo và handoff thông minh',
    desc: 'Lưu transcript, tóm tắt nội dung và chuyển tiếp cho người thật khi phát sinh tình huống phức tạp.',
  },
]

const steps = [
  {
    title: 'Nạp kiến thức cho LINH',
    desc: 'Tải tài liệu nghiệp vụ, bảng giá, kịch bản chăm sóc khách hàng và FAQ vào hệ thống.',
  },
  {
    title: 'Thiết lập luồng hội thoại',
    desc: 'Cấu hình kịch bản xác nhận đơn, tư vấn, chuyển tiếp nhân sự và xử lý ngoài giờ.',
  },
  {
    title: 'Kết nối hotline doanh nghiệp',
    desc: 'Gắn với số hotline hiện có để chạy thử, theo dõi hiệu suất và tối ưu dần theo từng use case.',
  },
]

const industriesMatrix = [
  { name: 'Viễn thông', icon: '📡' },
  { name: 'Năng lượng', icon: '⚡' },
  { name: 'Ô tô', icon: '🚗' },
  { name: 'Hoá chất', icon: '🧪' },
  { name: 'Tư vấn', icon: '💼' },
  { name: 'Truyền thông', icon: '📺' },
  { name: 'Thể thao', icon: '⚽' },
  { name: 'Làm đẹp', icon: '💄' },
  { name: 'Y tế', icon: '🏥' },
  { name: 'Dược phẩm', icon: '💊' },
  { name: 'Dịch vụ', icon: '🛎️' },
  { name: 'Luật pháp', icon: '⚖️' },
  { name: 'Bán lẻ', icon: '🛒' },
  { name: 'Ngân hàng', icon: '🏦' },
  { name: 'Sản xuất', icon: '🏭' },
  { name: 'Xây dựng', icon: '🏗️' },
  { name: 'Logistics', icon: '📦' },
  { name: 'Dệt may', icon: '👔' },
  { name: 'Thực phẩm', icon: '🍽️' },
  { name: 'Bất động sản', icon: '🏢' },
  { name: 'Tài chính', icon: '💰' },
  { name: 'Môi trường', icon: '🌱' },
  { name: 'Thời trang', icon: '👗' },
  { name: 'Điện tử', icon: '💻' },
  { name: 'Vận tải', icon: '🚚' },
  { name: 'Marketing', icon: '📊' },
  { name: 'Kế toán', icon: '📈' },
  { name: 'Khách sạn', icon: '🏨' },
]

function IconSpark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2l1.8 4.6L18 8.4l-4.2 1.8L12 15l-1.8-4.8L6 8.4l4.2-1.8L12 2z" fill="currentColor" />
      <path d="M19 14l.9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9L19 14z" fill="currentColor" />
      <path d="M5 14l.9 2.1L8 17l-2.1.9L5 20l-.9-2.1L2 17l2.1-.9L5 14z" fill="currentColor" />
    </svg>
  )
}

function IconCall() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6.6 10.8a15.2 15.2 0 0 0 6.6 6.6l2.2-2.2c.3-.3.8-.4 1.2-.3 1 .3 2 .4 3 .4.7 0 1.2.5 1.2 1.2V20c0 .7-.5 1.2-1.2 1.2C10 21.2 2.8 14 2.8 5.2 2.8 4.5 3.3 4 4 4h3.5c.7 0 1.2.5 1.2 1.2 0 1 .1 2 .4 3 .1.4 0 .9-.3 1.2l-2.2 2.4Z" fill="currentColor" />
    </svg>
  )
}

function IconEndCall() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08a.956.956 0 0 1-.29-.7c0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.1-.7-.28a11.27 11.27 0 0 0-2.67-1.85.996.996 0 0 1-.56-.9v-3.1C15.15 9.25 13.6 9 12 9Z" fill="currentColor" />
    </svg>
  )
}

function IconChart() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 19h16v2H2V3h2v16Zm4-2H6V9h2v8Zm5 0h-2V5h2v12Zm5 0h-2v-6h2v6Z" fill="currentColor" />
    </svg>
  )
}

function IconShield() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2 4 5v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V5l-8-3Zm-1 14-4-4 1.4-1.4 2.6 2.6 5.6-5.6L18 9l-7 7Z" fill="currentColor" />
    </svg>
  )
}

const BACKEND_URL = 'http://localhost:8000'

function App() {
  const [showLogin, setShowLogin] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState({})
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
      // Xin quyền microphone
      await navigator.mediaDevices.getUserMedia({ audio: true })

      // Lấy signed URL từ backend
      const response = await fetch(`${BACKEND_URL}/api/signed-url`)
      if (!response.ok) {
        throw new Error('Không thể lấy signed URL từ server')
      }
      const data = await response.json()

      // Kết nối tới ElevenLabs Agent
      await conversation.startSession({
        signedUrl: data.signed_url,
      })
    } catch (error) {
      console.error('Lỗi kết nối voice agent:', error)
      setVoiceConnecting(false)
      alert('Không thể kết nối voice agent. Vui lòng thử lại.')
    }
  }

  const getVoiceRingClass = () => {
    if (voiceConnecting) return 'voice-ring connecting'
    if (conversation.status === 'connected') {
      return conversation.isSpeaking ? 'voice-ring connected speaking' : 'voice-ring connected'
    }
    return 'voice-ring'
  }

  const getVoiceStatusText = () => {
    if (voiceConnecting) return 'Đang kết nối...'
    if (conversation.status === 'connected') {
      return conversation.isSpeaking ? 'LINH đang nói...' : 'LINH đang lắng nghe...'
    }
    return 'Nhấn để trò chuyện với LINH'
  }

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleLogin = (e) => {
    e.preventDefault()
    const newErrors = {}

    if (!formData.email) {
      newErrors.email = 'Vui lòng nhập email'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email không hợp lệ'
    }

    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Login logic here
    alert('Đăng nhập thành công!')
  }

  const handleRegister = () => {
    alert('Chức năng đăng ký đang được phát triển')
  }

  return (
    <div className="page-shell">
      <header className="navbar">
        <div className="brand">
          <div className="brand-mark brand-logo-wrap">
            <img className="brand-logo" src="/linh-logo.png" alt="LINH logo" />
          </div>
          <div>
            <p className="brand-title">LINH AI</p>
            <p className="brand-sub">AI Voice Agent for EXE101</p>
          </div>
        </div>

        <nav className="nav-links">
          <a href="#tinh-nang">Tính năng</a>
          <a href="#quy-trinh">Quy trình</a>
          <a href="#nganh-nghe">Ngành nghề</a>
          <a href="#minh-chung">Minh chứng</a>
        </nav>

        <button className="btn btn-primary btn-sm" onClick={() => setShowLogin(true)}>Dùng thử ngay</button>
      </header>

      <main>
        <section className="hero section" id="hero">
          <div className="hero-badge">
            <span className="icon-wrap small"><IconSpark /></span>
            AI Voice Agent cho doanh nghiệp Việt
          </div>

          <div className="hero-content">
            <div className="hero-copy">
              <h1>
                <span className="hero-brand">LINH</span> là trợ lý AI giúp doanh nghiệp
                <br />
                không bỏ lỡ khách hàng 24/7
              </h1>
              <p>

              </p>

              <div className="hero-actions">
                <button className="btn btn-primary" onClick={() => setShowLogin(true)}>Dùng thử ngay</button>
                <a className="btn btn-secondary" href="#tinh-nang">Khám phá tính năng</a>
              </div>

              <div className="stats-grid">
                {stats.map((item) => (
                  <div key={item.label} className="stat-card">
                    <p>{item.label}</p>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="hero-panel glass-card">
              <div className="panel-left">
                <div className="mini-card">
                  <span>Đang xử lý</span>
                  <strong>12 cuộc gọi cùng lúc</strong>
                </div>
                <div className="mini-card">
                  <span>Kịch bản chuẩn</span>
                  <strong>100% nhất quán</strong>
                </div>
              </div>

              <div className="panel-right">
                <div
                  className={getVoiceRingClass()}
                  onClick={handleVoiceClick}
                  role="button"
                  tabIndex={0}
                  title={conversation.status === 'connected' ? 'Nhấn để kết thúc' : 'Nhấn để trò chuyện'}
                >
                  <div className="voice-core">
                    {conversation.status === 'connected' ? <IconEndCall /> : <IconCall />}
                  </div>
                </div>
                <p className="voice-status">{getVoiceStatusText()}</p>
                <h3>
                  {conversation.status === 'connected'
                    ? '"Đang trò chuyện với LINH..."'
                    : '"Chào LINH, tôi muốn xác nhận đơn hàng và kiểm tra lịch giao."'}
                </h3>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="tinh-nang">
          <div className="section-heading center">
            <p className="eyebrow">Lợi ích cốt lõi</p>
            <h2>Thiết kế cho đúng pain point của dự án EXE</h2>
            <p>
              Tập trung vào bài toán bỏ lỡ khách hàng, quy trình rời rạc, nhân sự quá tải và nhu cầu hỗ trợ
              ngoài giờ.
            </p>
          </div>

          <div className="feature-grid">
            <article className="feature-card glass-card">
              <div className="icon-wrap"><IconCall /></div>
              <h3>{features[0].title}</h3>
              <p>{features[0].desc}</p>
            </article>
            <article className="feature-card glass-card">
              <div className="icon-wrap"><IconChart /></div>
              <h3>{features[1].title}</h3>
              <p>{features[1].desc}</p>
            </article>
            <article className="feature-card glass-card">
              <div className="icon-wrap"><IconSpark /></div>
              <h3>{features[2].title}</h3>
              <p>{features[2].desc}</p>
            </article>
            <article className="feature-card glass-card">
              <div className="icon-wrap"><IconShield /></div>
              <h3>{features[3].title}</h3>
              <p>{features[3].desc}</p>
            </article>
          </div>
        </section>

        <section className="section alt-section">
          <div className="section-heading center">
            <p className="eyebrow">Khách hàng nói gì</p>
            <h2>Đừng tin em nói, hãy nghe khách hàng em nói</h2>
          </div>

          <div className="testimonial-grid">
            {testimonials.map((item) => (
              <article className="testimonial-card glass-card" key={item.name}>
                <div className="testimonial-head">
                  <div className="avatar">{item.name.charAt(0)}</div>
                  <div>
                    <h3>{item.name}</h3>
                    <p>{item.role}</p>
                  </div>
                </div>
                <blockquote>“{item.quote}”</blockquote>
                <div className="reply-bubble">{item.reply}</div>
              </article>
            ))}
          </div>
        </section>

        <section className="section" id="quy-trinh">
          <div className="section-heading center">
            <p className="eyebrow">Triển khai</p>
            <h2>3 bước để đưa LINH vào vận hành</h2>
          </div>

          <div className="steps-grid">
            {steps.map((item, index) => (
              <article className="step-card glass-card" key={item.title}>
                <span className="step-index">0{index + 1}</span>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section alt-section" id="nganh-nghe">
          <div className="section-heading center">
            <p className="eyebrow">Ứng dụng</p>
            <h2>LINH phục vụ đa ngành nghề</h2>
            <p>
              LINH có thể triển khai cho nhiều mô hình doanh nghiệp với luồng tư vấn,
              chăm sóc khách hàng, xác nhận đơn, đặt lịch và sàng lọc nhu cầu tự động.
            </p>
          </div>

          <div className="industry-matrix">
            <div className="industry-center-card">
              <img className="industry-center-logo" src="/linh-logo.png" alt="LINH logo" />
            </div>

            {industriesMatrix.map((item, index) => (
              <button
                key={`${item.name}-${index}`}
                type="button"
                className="industry-tile"
              >
                <span className="industry-icon">{item.icon}</span>
                <span className="industry-name">{item.name}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="section" id="minh-chung">
          <div className="proof-card glass-card">
            <div className="proof-copy">
              <p className="eyebrow">Minh chứng dự án</p>
              <h2>Giải nhì VNPT AI Hackathon - AI Voice Agent</h2>

              <ul className="proof-points">
                <li>Tên AI assistant: LINH</li>
                <li>Á Quân 2026</li>

              </ul>
            </div>

            <div className="proof-visual">
              <div className="award-badge">TOP 2</div>
              <img
                src="/hackathon.png"
                alt="VNPT AI Hackathon - Giải nhì"
                className="proof-image"
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div>
          <p className="brand-title">LINH AI</p>
          <p className="footer-text">
            Landing page demo cho dự án EXE101, xây theo React và tối ưu để bạn tiếp tục nối API hoặc thêm routing sau.
          </p>
        </div>

        <div className="footer-links">
          <a href="#hero">Trang đầu</a>
          <a href="#tinh-nang">Tính năng</a>
          <a href="#minh-chung">Minh chứng</a>
        </div>
      </footer>

      {showLogin && (
        <div className="modal-overlay" onClick={() => setShowLogin(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowLogin(false)}>×</button>

            <div className="login-header">
              <div className="brand-mark brand-logo-wrap">
                <img className="brand-logo" src="/linh-logo.png" alt="LINH logo" />
              </div>
              <h2>Đăng nhập vào LINH AI</h2>
              <p>Trải nghiệm AI Voice Agent cho doanh nghiệp</p>
            </div>

            <form onSubmit={handleLogin} className="login-form">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="text"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={errors.email ? 'input-error' : ''}
                  placeholder="example@company.com"
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="password">Mật khẩu</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={errors.password ? 'input-error' : ''}
                  placeholder="Nhập mật khẩu"
                />
                {errors.password && <span className="error-message">{errors.password}</span>}
              </div>

              <button type="submit" className="btn btn-primary btn-full">
                Đăng nhập
              </button>

              <div className="form-divider">
                <span>hoặc</span>
              </div>

              <button type="button" className="btn btn-secondary btn-full" onClick={handleRegister}>
                Đăng ký tài khoản mới
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
