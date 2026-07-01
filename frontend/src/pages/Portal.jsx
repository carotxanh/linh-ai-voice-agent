import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import RippleText from '../components/RippleText'
import { getAccountIntegration, getVoiceDashboard } from '../services/voice'
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
    successfulCalls: 0,
    reviewRequiredCalls: 0,
    inboundCalls: 0,
    outboundCalls: 0,
    webCalls: 0,
    averageDuration: '0:00',
    averageLatencyMs: 0,
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

function callOutcome(call) {
  if (call.successful === true) return { text: 'Thành công', tone: 'success', icon: 'check_circle' }
  if (call.reviewRequired || call.successful === false) return { text: 'Cần xem lại', tone: 'warning', icon: 'priority_high' }
  return { text: statusLabel(call.status), tone: call.status === 'completed' ? 'info' : 'warning', icon: call.status === 'completed' ? 'call' : 'warning' }
}

function hasVietnameseText(value = '') {
  return /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(value)
}

function vietnamizeSummary(value) {
  if (!value) return ''
  if (hasVietnameseText(value)) return value

  return [
    [/\bthe agent\b/gi, 'LinhVoice'],
    [/\bagent\b/gi, 'LinhVoice'],
    [/\bthe user\b/gi, 'khách hàng'],
    [/\bthe customer\b/gi, 'khách hàng'],
    [/\buser\b/gi, 'khách hàng'],
    [/\bcustomer\b/gi, 'khách hàng'],
    [/\bcalled\b/gi, 'đã gọi'],
    [/\basked\b/gi, 'đã hỏi'],
    [/\bagreed\b/gi, 'đồng ý'],
    [/\bscheduled\b/gi, 'đã đặt lịch'],
    [/\bappointment\b/gi, 'lịch hẹn'],
  ].reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), value)
}

export default function Portal() {
  const navigate = useNavigate()
  const [dashboard, setDashboard] = useState(emptyDashboard)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [dataSource, setDataSource] = useState('idle')
  const [needsConnection, setNeedsConnection] = useState(false)

  const loadDashboard = async () => {
    setIsLoading(true)
    setLoadError('')
    setNeedsConnection(false)

    try {
      const integration = await getAccountIntegration()
      if (!integration.has_api_key || !integration.api_base_url) {
        setDashboard(emptyDashboard)
        setDataSource('error')
        setNeedsConnection(true)
        setLoadError(integration.message || 'Tài khoản chưa có Retell API key. Vào Settings để kết nối.')
        return
      }

      const data = await getVoiceDashboard(100)
      setDashboard(data)
      setDataSource('live')
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
      change: `${dashboard.stats.completedCalls} hoàn tất, ${dashboard.stats.activeCalls} Đang xử lý`,
      positive: true,
    },
    {
      label: 'Kết quả tốt',
      value: `${dashboard.stats.successRate}%`,
      icon: 'task_alt',
      change: `${dashboard.stats.successfulCalls || 0} thành công, ${dashboard.stats.reviewRequiredCalls || 0} cần xem lại`,
      positive: true,
    },
    {
      label: 'Thời lượng TB',
      value: dashboard.stats.averageDuration,
      icon: 'timer',
      change: `${dashboard.stats.averageLatencyMs || 0} ms Độ trễ TB`,
      positive: true,
    },
    {
      label: 'Chi phí Retell',
      value: formatCost(dashboard.stats.totalCost),
      icon: 'payments',
      change: `${dashboard.stats.inboundCalls || 0} inbound, ${dashboard.stats.outboundCalls || 0} outbound`,
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
            <p className="portal-subtitle">Tổng quan cuộc gọi Retell, kết quả khách hàng, LinhVoice AI, hotline và kho dữ liệu đang dùng.</p>
          </div>
          <div className="portal-header-actions">
            <span className={`portal-api-note ${dataSource === 'live' ? 'live' : ''}`}>
              {dataSource === 'live' ? 'Đã kết nối Retell' : 'Chưa kết nối'}
            </span>
            <button className="btn-secondary" onClick={loadDashboard} disabled={isLoading}>
              {isLoading ? 'Đang cập nhật' : 'Làm mới'}
            </button>
          </div>
        </div>

        {loadError && (
          <div className="api-alert">
            <MIcon name="info" size={18} />
            <span>Không thể tải dữ liệu tổng quan: {loadError}.</span>
            {needsConnection && (
              <button type="button" className="api-alert-action" onClick={() => navigate('/settings')}>
                Mở Settings
              </button>
            )}
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
              {dashboard.recentCalls.length > 0 ? dashboard.recentCalls.map((call) => {
                const outcome = callOutcome(call)
                return (
                  <button className="activity-item clickable" key={call.id} onClick={() => navigate('/call-history')}>
                    <div className={`activity-icon ${outcome.tone}`}>
                      <MIcon name={outcome.icon} size={18} />
                    </div>
                    <div className="activity-content">
                      <p className="activity-title">{call.assistantName || 'LinhVoice'} với {call.customerNumber || call.phoneNumber || 'khách hàng'}</p>
                      <p className="activity-time">{formatDateTime(call.timestamp)} ? {call.summary ? vietnamizeSummary(call.summary) : (call.endedReason || statusLabel(call.status))}</p>
                    </div>
                    <span className={`activity-badge ${outcome.tone}`}>
                      {outcome.text}
                    </span>
                  </button>
                )
              }) : (
                <p className="portal-empty-note">Chưa có cuộc gọi nao duoc ghi nhan.</p>
              )}
            </div>
          </div>

          <div className="content-card">
            <div className="card-header">
              <RippleText>
                <h3>LinhVoice</h3>
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
                    Voice: {assistant.voiceProvider || '-'} ? Language: {assistant.transcriberLanguage || '-'}
                  </div>
                </div>
              ))}
              {dashboard.assistants.length === 0 && <p className="portal-empty-note">Chưa có LinhVoice AI nao.</p>}
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
                    <p className="activity-time">{phoneNumber.assistantName || 'Chưa gán LinhVoice'}</p>
                  </div>
                </div>
              ))}
              {dashboard.phoneNumbers.length === 0 && <p className="portal-empty-note">Chưa có hotline nao duoc ket noi.</p>}
            </div>
          </div>

          <div className="content-card">
            <div className="card-header">
              <RippleText>
                <h3>Dữ liệu và cảnh báo</h3>
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
                  <span className="performance-value">{dashboard.stats.reviewRequiredCalls || 0}</span>
                </div>
                <div className="stat-change">
                  {dashboard.stats.missedCalls} nhỡ, {dashboard.stats.transferredCalls} chuyển tiếp, {dashboard.stats.webCalls || 0} web call
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
