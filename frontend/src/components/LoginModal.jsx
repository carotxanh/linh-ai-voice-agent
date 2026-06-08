import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../utils/auth'

export default function LoginModal({ show, onClose }) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState({})

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
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

    // Thực hiện đăng nhập
    const result = login(formData.email, formData.password)
    if (result.success) {
      onClose()
      navigate('/portal')
    } else {
      setErrors({ email: result.error })
    }
  }

  const handleRegister = () => {
    alert('Tạo tài khoản mới:\nVui lòng nhập email công ty và mật khẩu, đội ngũ LINH AI sẽ kích hoạt tài khoản cho bạn.')
  }

  if (!show) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>

        <div className="login-header">
          <div className="brand-mark brand-logo-wrap">
            <img className="brand-logo" src="/linh-logo.png" alt="LINH logo" />
          </div>
          <h2>Đăng nhập vào LINH AI</h2>
          <p>Cổng đăng nhập và đăng ký tài khoản LINH AI</p>
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
  )
}

// PropTypes removed for simplicity
