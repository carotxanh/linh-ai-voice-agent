import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, register } from '../utils/auth'

export default function LoginModal({ show, onClose }) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState({})
  const [isRegistering, setIsRegistering] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleLogin = async (event) => {
    event.preventDefault()
    const newErrors = {}

    if (isRegistering && !formData.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ tên'
    }

    if (!formData.email) {
      newErrors.email = 'Vui lòng nhập email'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email không hợp lệ'
    }

    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)
    const result = isRegistering
      ? await register({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
      })
      : await login(formData.email, formData.password)
    setIsSubmitting(false)

    if (result.success) {
      onClose()
      navigate('/portal')
    } else {
      setErrors({ email: result.error })
    }
  }

  const toggleMode = () => {
    setErrors({})
    setIsRegistering((value) => !value)
  }

  if (!show) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>

        <div className="login-header">
          <div className="brand-mark brand-logo-wrap">
            <img className="brand-logo" src="/linh-logo.png" alt="LINH logo" />
          </div>
          <h2>{isRegistering ? 'Tạo tài khoản LinhVoice' : 'Đăng nhập LinhVoice'}</h2>
          <p>{isRegistering ? 'Tạo tài khoản chủ doanh nghiệp để quản lý trợ lý AI' : 'Đăng nhập để quản lý cuộc gọi và dữ liệu doanh nghiệp'}</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          {isRegistering && (
            <div className="form-group">
              <label htmlFor="fullName">Họ tên</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className={errors.fullName ? 'input-error' : ''}
                placeholder="Nguyễn Văn A"
              />
              {errors.fullName && <span className="error-message">{errors.fullName}</span>}
            </div>
          )}

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

          <button type="submit" className="btn btn-primary btn-full" disabled={isSubmitting}>
            {isSubmitting ? 'Đang xử lý...' : isRegistering ? 'Tạo tài khoản' : 'Đăng nhập'}
          </button>

          <div className="form-divider">
            <span>hoặc</span>
          </div>

          <button type="button" className="btn btn-secondary btn-full" onClick={toggleMode}>
            {isRegistering ? 'Tôi đã có tài khoản' : 'Tạo tài khoản mới'}
          </button>
        </form>
      </div>
    </div>
  )
}
