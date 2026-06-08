import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import RippleText from '../components/RippleText'
import { getVapiDashboard } from '../services/vapi'
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

const emptyDashboard = {
  stats: {
    totalCalls: 0,
    completedCalls: 0,
    activeCalls: 0,
    transferredCalls: 0,
    missedCalls: 0,
    averageDuration: '0:00',
    successRate: 0,
    totalCost: 0,
    assistantCount: 0,
    phoneNumberCount: 0,
    fileCount: 0,
    processedFileCount: 0,
  },
  recentCalls: [],
  assistants: [],
  phoneNumbers: [],
}

function formatDateTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function formatCost(value) {
  return `$${Number(value || 0).toFixed(4)}`
}

function statusLabel(status) {
  if (status === 'completed') return 'Hoàn tất'
  if (status === 'active') return 'Đang xử lý'
  if (status === 'missed') return 'Nhỡ'
  if (status === 'transferred') return 'Chuyển tiếp'
  return status || 'Không rõ'
}

export default function Portal() {
  const navigate = useNavigate()
  const [dashboard, setDashboard] = useState(emptyDashboard)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [dataSource, setDataSource] = useState('idle')

  const loadDashboard = async () => {
    setIsLoading(true)
    setLoadError('')

    try {
      const data = await getVapiDashboard(50)
      setDashboard(data)
      setDataSource('vapi')
    } catch (error) {
      setDashboard(emptyDashboard)
      setDataSource('error')
      setLoadError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  const stats = useMemo(() => [
    {
      label: 'Tổng cuộc gọi',
      value: dashboard.stats.totalCalls,
      icon: 'call',
      change: `${dashboard.stats.completedCalls} hoàn tất, ${dashboard.stats.activeCalls} đang xử lý`,
      positive: true,
    },
    {
      label: 'Thời lượng TB',
      value: dashboard.stats.averageDuration,
      icon: 'timer',
      change: `${dashboard.stats.successRate}% hoàn tất`,
      positive: true,
    },
    {
      label: 'Chi phí cuộc gọi',
      value: formatCost(dashboard.stats.totalCost),
      icon: 'payments',
      change: 'Từ các cuộc gọi đã đồng bộ',
    },
    {
      label: 'Cấu hình đang dùng',
      value: dashboard.stats.assistantCount,
      icon: 'hub',
      change: `${dashboard.stats.phoneNumberCount} hotline, ${dashboard.stats.fileCount} tài liệu`,
    },
  ], [dashboard])

  return (
    <DashboardLayout>
      <div className="portal-page">
        <div className="portal-header">
          <div className="portal-header-left">
            <RippleText>
              <h1>LinhVoice</h1>
            </RippleText>
            <p className="portal-subtitle">Tổng quan vận hành cuộc gọi, trợ lý AI, hotline và kho dữ liệu doanh nghiệp.</p>
          </div>
          <div className="portal-header-actions">
            <span className={`portal-api-note ${dataSource === 'vapi' ? 'live' : ''}`}>
              {dataSource === 'vapi' ? 'Đã kết nối' : 'Chưa kết nối'}
            </span>
            <button className="btn-secondary" onClick={loadDashboard} disabled={isLoading}>
              {isLoading ? 'Đang cập nhật' : 'Cập nhật'}
            </button>
          </div>
        </div>

        {loadError && (
          <div className="api-alert">
            <MIcon name="info" size={18} />
            Không thể tải dữ liệu tổng quan: {loadError}.
          </div>
        )}

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
                <h3>Cuộc gọi gần đây</h3>
              </RippleText>
              <button className="btn-text" onClick={() => navigate('/call-history')}>Xem tất cả</button>
            </div>
            <div className="activity-list">
              {dashboard.recentCalls.length > 0 ? dashboard.recentCalls.map((call) => (
                <div className="activity-item" key={call.id}>
                  <div className={`activity-icon ${call.status === 'completed' ? 'success' : 'warning'}`}>
                    <MIcon name={call.status === 'completed' ? 'call' : 'warning'} size={18} />
                  </div>
                  <div className="activity-content">
                    <p className="activity-title">{call.assistantName || 'Trợ lý AI'} gọi {call.phoneNumber}</p>
                    <p className="activity-time">{formatDateTime(call.timestamp)} · {call.endedReason || statusLabel(call.status)}</p>
                  </div>
                  <span className={`activity-badge ${call.status === 'completed' ? 'success' : 'warning'}`}>
                    {formatCost(call.cost)}
                  </span>
                </div>
              )) : (
                <p className="portal-empty-note">Chưa có cuộc gọi nào được ghi nhận.</p>
              )}
            </div>
          </div>

          <div className="content-card">
            <div className="card-header">
              <RippleText>
                <h3>Trợ lý AI</h3>
              </RippleText>
              <button className="btn-text" onClick={() => navigate('/settings')}>Thiết lập</button>
            </div>
            <div className="performance-list">
              {dashboard.assistants.slice(0, 4).map((assistant) => (
                <div className="performance-item" key={assistant.id}>
                  <div className="performance-label">
                    <span>{assistant.name}</span>
                    <span className="performance-value">{assistant.modelName || assistant.modelProvider || '-'}</span>
                  </div>
                  <div className="stat-change">
                    Giọng nói: {assistant.voiceProvider || '-'} · Nhận diện: {assistant.transcriberLanguage || '-'}
                  </div>
                </div>
              ))}
              {dashboard.assistants.length === 0 && <p className="portal-empty-note">Chưa có trợ lý AI nào.</p>}
            </div>
          </div>
        </div>

        <div className="content-grid compact">
          <div className="content-card">
            <div className="card-header">
              <RippleText>
                <h3>Hotline</h3>
              </RippleText>
            </div>
            <div className="activity-list">
              {dashboard.phoneNumbers.slice(0, 4).map((phoneNumber) => (
                <div className="activity-item" key={phoneNumber.id}>
                  <div className="activity-icon info">
                    <MIcon name="settings_phone" size={18} />
                  </div>
                  <div className="activity-content">
                    <p className="activity-title">{phoneNumber.number || phoneNumber.name}</p>
                    <p className="activity-time">{phoneNumber.assistantName || phoneNumber.assistantId || 'Chưa gán trợ lý AI'}</p>
                  </div>
                </div>
              ))}
              {dashboard.phoneNumbers.length === 0 && <p className="portal-empty-note">Chưa có hotline nào được kết nối.</p>}
            </div>
          </div>

          <div className="content-card">
            <div className="card-header">
              <RippleText>
                <h3>Xử lý dữ liệu</h3>
              </RippleText>
              <button className="btn-text" onClick={() => navigate('/knowledge')}>Mở kho dữ liệu</button>
            </div>
            <div className="performance-list">
              <div className="performance-item">
                <div className="performance-label">
                  <span>Tài liệu đã xử lý</span>
                  <span className="performance-value">{dashboard.stats.processedFileCount}/{dashboard.stats.fileCount}</span>
                </div>
                <div className="performance-bar">
                  <div
                    className="performance-fill"
                    style={{
                      width: dashboard.stats.fileCount
                        ? `${Math.round((dashboard.stats.processedFileCount / dashboard.stats.fileCount) * 100)}%`
                        : '0%',
                    }}
                  ></div>
                </div>
              </div>
              <div className="performance-item">
                <div className="performance-label">
                  <span>Cuộc gọi cần xem lại</span>
                  <span className="performance-value">{dashboard.stats.transferredCalls + dashboard.stats.missedCalls}</span>
                </div>
                <div className="stat-change">
                  {dashboard.stats.transferredCalls} chuyển tiếp, {dashboard.stats.missedCalls} nhỡ
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
