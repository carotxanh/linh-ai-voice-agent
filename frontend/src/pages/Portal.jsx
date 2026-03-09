import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import RippleText from '../components/RippleText'
import './Portal.css'

function MIcon({ name, className = '', filled = false, size = 24 }) {
  return (
    <span
      className={`material-symbols-rounded ${className}`}
      style={{
        fontSize: size,
        fontVariationSettings: filled ? "'FILL' 1" : "'FILL' 0",
      }}
    >
      {name}
    </span>
  )
}

export default function Portal() {
  const navigate = useNavigate()

  const stats = [
    { label: 'Tổng cuộc gọi hôm nay', value: '24', icon: 'call', change: '+12% so với hôm qua', positive: true },
    { label: 'Đang xử lý', value: '3', icon: 'schedule', change: 'Đang hoạt động' },
    { label: 'Hoàn thành', value: '21', icon: 'check_circle', change: '87.5% tỷ lệ thành công', positive: true },
    { label: 'Tỷ lệ hài lòng', value: '94%', icon: 'star', change: '+2% so với tuần trước', positive: true },
  ]

  return (
    <DashboardLayout>
      <div className="portal-page">
        <div className="portal-header">
          <div className="portal-header-left">
            <RippleText>
              <h1>Tổng quan</h1>
            </RippleText>
            <p className="portal-subtitle">Quản lý hệ thống AI Voice Agent</p>
          </div>
          <div className="portal-header-actions">
            <button className="btn-secondary" onClick={() => navigate('/')}>
              Về trang chủ
            </button>
          </div>
        </div>

        <div className="stats-grid">
          {stats.map((stat) => (
            <div key={stat.label} className="stat-card">
              <div className="stat-header">
                <span className="stat-label">{stat.label}</span>
                <MIcon name={stat.icon} className="stat-icon" size={22} filled />
              </div>
              <div className="stat-value">{stat.value}</div>
              <div className={stat.positive ? 'stat-change positive' : 'stat-change'}>
                {stat.change}
              </div>
            </div>
          ))}
        </div>

        <div className="content-grid">
          <div className="content-card">
            <div className="card-header">
              <RippleText>
                <h3>Hoạt động gần đây</h3>
              </RippleText>
              <button className="btn-text">Xem tất cả</button>
            </div>
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-icon success">
                  <MIcon name="call" size={18} />
                </div>
                <div className="activity-content">
                  <p className="activity-title">Cuộc gọi từ 0901234567</p>
                  <p className="activity-time">5 phút trước</p>
                </div>
                <span className="activity-badge success">Hoàn thành</span>
              </div>
              <div className="activity-item">
                <div className="activity-icon success">
                  <MIcon name="check_circle" size={18} />
                </div>
                <div className="activity-content">
                  <p className="activity-title">Đặt vé thành công - Nguyễn Văn A</p>
                  <p className="activity-time">15 phút trước</p>
                </div>
                <span className="activity-badge success">Thành công</span>
              </div>
              <div className="activity-item">
                <div className="activity-icon warning">
                  <MIcon name="warning" size={18} />
                </div>
                <div className="activity-content">
                  <p className="activity-title">Chuyển tiếp nhân viên - Khiếu nại</p>
                  <p className="activity-time">30 phút trước</p>
                </div>
                <span className="activity-badge warning">Chuyển tiếp</span>
              </div>
              <div className="activity-item">
                <div className="activity-icon info">
                  <MIcon name="bar_chart" size={18} />
                </div>
                <div className="activity-content">
                  <p className="activity-title">Báo cáo ngày đã được tạo</p>
                  <p className="activity-time">1 giờ trước</p>
                </div>
                <span className="activity-badge info">Hoàn tất</span>
              </div>
            </div>
          </div>

          <div className="content-card">
            <div className="card-header">
              <RippleText>
                <h3>Hiệu suất hệ thống</h3>
              </RippleText>
            </div>
            <div className="performance-list">
              <div className="performance-item">
                <div className="performance-label">
                  <span>Thời gian phản hồi TB</span>
                  <span className="performance-value">1.2s</span>
                </div>
                <div className="performance-bar">
                  <div className="performance-fill" style={{ width: '95%' }}></div>
                </div>
              </div>
              <div className="performance-item">
                <div className="performance-label">
                  <span>Độ chính xác STT</span>
                  <span className="performance-value">98.5%</span>
                </div>
                <div className="performance-bar">
                  <div className="performance-fill" style={{ width: '98.5%' }}></div>
                </div>
              </div>
              <div className="performance-item">
                <div className="performance-label">
                  <span>Tỷ lệ xử lý tự động</span>
                  <span className="performance-value">87%</span>
                </div>
                <div className="performance-bar">
                  <div className="performance-fill" style={{ width: '87%' }}></div>
                </div>
              </div>
              <div className="performance-item">
                <div className="performance-label">
                  <span>Uptime hệ thống</span>
                  <span className="performance-value">99.9%</span>
                </div>
                <div className="performance-bar">
                  <div className="performance-fill" style={{ width: '99.9%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
