import { useEffect, useMemo, useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { getVoiceCalls } from '../services/voice'
import './CallHistory.css'

const waveformHeights = Array.from({ length: 80 }, (_, index) => {
  const value = Math.sin(index * 1.7) * 0.5 + Math.sin(index * 0.43) * 0.5
  return `${Math.round(34 + Math.abs(value) * 66)}%`
})

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

const statusMap = {
  completed: { text: 'Hoàn tất', class: 'status-success' },
  active: { text: 'Đang xử lý', class: 'status-info' },
  transferred: { text: 'Chuyển tiếp', class: 'status-warning' },
  missed: { text: 'Nhỡ', class: 'status-error' },
  unknown: { text: 'Không rõ', class: 'status-muted' },
}

function getStatusInfo(status) {
  return statusMap[status] || { text: status || 'Không rõ', class: 'status-muted' }
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
  const amount = Number(value || 0)
  return `$${amount.toFixed(4)}`
}

function transcriptLines(transcript) {
  if (!transcript) return []

  return transcript
    .split('\n')
    .map((line) => {
      const match = line.match(/^(User|Customer|Caller|Assistant|AI|LINH|Khach|Khách):\s*(.*)$/i)
      if (!match) return { speaker: 'Transcript', text: line.trim(), isUser: false }
      return {
        speaker: match[1],
        text: match[2].trim(),
        isUser: /user|customer|caller|khach|khách/i.test(match[1]),
      }
    })
    .filter((line) => line.text)
}

export default function CallHistory() {
  const [calls, setCalls] = useState([])
  const [selectedCall, setSelectedCall] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [modalTab, setModalTab] = useState('summary')
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [dataSource, setDataSource] = useState('idle')

  const loadCalls = async () => {
    setIsLoading(true)
    setLoadError('')

    try {
      const voiceCalls = await getVoiceCalls(100)
      setCalls(Array.isArray(voiceCalls) ? voiceCalls : [])
      setDataSource('live')
    } catch (error) {
      setCalls([])
      setDataSource('error')
      setLoadError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCalls()
  }, [])

  const filteredCalls = useMemo(() => calls.filter((call) => {
    const query = searchQuery.toLowerCase()
    const matchesStatus = filterStatus === 'all' || call.status === filterStatus
    const searchable = [
      call.id,
      call.phoneNumber,
      call.customerNumber,
      call.assistantName,
      call.type,
      call.endedReason,
      call.rawStatus,
    ].join(' ').toLowerCase()

    return matchesStatus && searchable.includes(query)
  }), [calls, filterStatus, searchQuery])

  const openModal = (call) => {
    setSelectedCall(call)
    setModalTab('summary')
  }

  const closeModal = () => {
    setSelectedCall(null)
  }

  const handleOverlayClick = (event) => {
    if (event.target.classList.contains('modal-overlay')) {
      closeModal()
    }
  }

  const copyTranscript = async () => {
    if (!selectedCall?.transcript) return
    await navigator.clipboard.writeText(selectedCall.transcript)
  }

  const renderTabContent = () => {
    if (!selectedCall) return null

    if (modalTab === 'summary') {
      return (
        <div className="tab-content-area">
          <div className="modal-section">
            <h3 className="section-title">Tóm tắt cuộc gọi</h3>
            <div className="summary-box">
              <p>{selectedCall.summary || 'Cuộc gọi này chưa có tóm tắt.'}</p>
            </div>
          </div>
          <div className="customer-detail-stats">
            <div className="customer-stat-item">
              <span className="customer-stat-label">Chi phí</span>
              <span className="customer-stat-value">{formatCost(selectedCall.cost)}</span>
            </div>
            <div className="customer-stat-item">
              <span className="customer-stat-label">Tin nhắn</span>
              <span className="customer-stat-value">{selectedCall.messageCount || 0}</span>
            </div>
            <div className="customer-stat-item">
              <span className="customer-stat-label">Thời lượng</span>
              <span className="customer-stat-value">{selectedCall.duration}</span>
            </div>
            <div className="customer-stat-item">
              <span className="customer-stat-label">Lý do kết thúc</span>
              <span className="customer-stat-value highlight">{selectedCall.endedReason || '-'}</span>
            </div>
          </div>
        </div>
      )
    }

    if (modalTab === 'transcript') {
      const lines = transcriptLines(selectedCall.transcript)

      return (
        <div className="tab-content-area">
          {lines.length > 0 ? (
            <div className="transcript-container">
              {lines.map((line, index) => (
                <div key={`${line.speaker}-${index}`} className={line.isUser ? 'transcript-message customer' : 'transcript-message agent'}>
                  <div className="message-avatar">
                    <MIcon name={line.isUser ? 'person' : 'smart_toy'} size={18} />
                  </div>
                  <div className="message-content">
                    <div className="message-header">
                      <span className="message-sender">{line.isUser ? 'Khách hàng' : 'Trợ lý AI'}</span>
                    </div>
                    <div className="message-text">{line.text}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-transcript">
              <MIcon name="chat_bubble_outline" size={40} className="empty-icon-material" />
              <p>Cuộc gọi này chưa có nội dung hội thoại.</p>
            </div>
          )}
        </div>
      )
    }

    return (
      <div className="tab-content-area">
        <div className="customer-detail-card">
          <div className="customer-detail-section">
            <h4>Mã tham chiếu</h4>
            <div className="sidebar-info-list">
              <div className="sidebar-info-row">
                <span className="sidebar-label">Mã cuộc gọi</span>
                <span className="sidebar-value">{selectedCall.id}</span>
              </div>
              <div className="sidebar-info-row">
                <span className="sidebar-label">Mã trợ lý</span>
                <span className="sidebar-value">{selectedCall.assistantId || '-'}</span>
              </div>
              <div className="sidebar-info-row">
                <span className="sidebar-label">Mã hotline</span>
                <span className="sidebar-value">{selectedCall.phoneNumberId || '-'}</span>
              </div>
            </div>
          </div>
          <div className="customer-detail-section">
            <h4>Chi phí chi tiết</h4>
            <div className="sidebar-info-list">
              {Object.entries(selectedCall.costBreakdown || {}).length > 0 ? (
                Object.entries(selectedCall.costBreakdown).map(([key, value]) => (
                  <div className="sidebar-info-row" key={key}>
                    <span className="sidebar-label">{key}</span>
                    <span className="sidebar-value">{formatCost(value)}</span>
                  </div>
                ))
              ) : (
                <p className="customer-note">Chưa có chi phí chi tiết cho cuộc gọi này.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="call-history-page">
        <div className="page-header">
          <div className="page-header-left">
            <h1>Lịch sử cuộc gọi</h1>
            <span className="call-count">{filteredCalls.length} cuộc gọi</span>
            <span className={`data-source-badge ${dataSource}`}>
              {dataSource === 'live' ? 'Đã kết nối' : 'Chưa kết nối'}
            </span>
          </div>
          <div className="page-header-actions">
            <button className="btn-refresh" onClick={loadCalls} disabled={isLoading}>
              <MIcon name={isLoading ? 'progress_activity' : 'refresh'} size={18} />
              {isLoading ? 'Đang tải' : 'Làm mới'}
            </button>
          </div>
        </div>

        {loadError && (
          <div className="api-alert">
            <MIcon name="info" size={18} />
            Không thể tải lịch sử cuộc gọi: {loadError}.
          </div>
        )}

        <div className="toolbar">
          <div className="search-box">
            <MIcon name="search" size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Tìm theo số điện thoại, trợ lý AI, lý do kết thúc..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-tabs">
            {[
              ['all', 'Tất cả'],
              ['active', 'Đang xử lý'],
              ['completed', 'Hoàn tất'],
              ['transferred', 'Chuyển tiếp'],
              ['missed', 'Nhỡ'],
            ].map(([value, label]) => (
              <button
                key={value}
                className={filterStatus === value ? 'filter-tab active' : 'filter-tab'}
                onClick={() => setFilterStatus(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="call-table-wrapper">
          <table className="call-table">
            <thead>
              <tr>
                <th>Cuộc gọi</th>
                <th>Loại</th>
                <th>Trợ lý AI</th>
                <th>Khách hàng</th>
                <th>Thời lượng</th>
                <th>Chi phí</th>
                <th>Trạng thái</th>
                <th>Lý do kết thúc</th>
                <th>Bắt đầu</th>
              </tr>
            </thead>
            <tbody>
              {filteredCalls.map((call) => {
                const statusInfo = getStatusInfo(call.status)
                return (
                  <tr key={call.id} className="call-table-row" onClick={() => openModal(call)}>
                    <td>
                      <span className="cell-phone">{String(call.id || '').slice(0, 8) || '-'}</span>
                    </td>
                    <td>
                      <span className="cell-messages">{call.type || '-'}</span>
                    </td>
                    <td>
                      <div className="cell-agent">
                        <MIcon name="smart_toy" size={18} className="agent-icon-small" />
                        <span>{call.assistantName || 'Trợ lý AI'}</span>
                      </div>
                    </td>
                    <td>
                      <span className="cell-phone">{call.customerNumber || call.phoneNumber}</span>
                    </td>
                    <td>
                      <span className="cell-duration">{call.duration}</span>
                    </td>
                    <td>
                      <span className="cell-duration">{formatCost(call.cost)}</span>
                    </td>
                    <td>
                      <span className={`call-table-status ${statusInfo.class}`}>{statusInfo.text}</span>
                    </td>
                    <td>
                      <span className="cell-date">{call.endedReason || call.rawStatus || '-'}</span>
                    </td>
                    <td>
                      <span className="cell-date">{formatDateTime(call.timestamp)}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {isLoading && (
            <div className="empty-state">
              <MIcon name="progress_activity" size={48} className="empty-icon-material loading-spin" />
              <h3>Đang tải lịch sử cuộc gọi</h3>
              <p>Đang lấy các cuộc gọi mới nhất.</p>
            </div>
          )}

          {!isLoading && filteredCalls.length === 0 && (
            <div className="empty-state">
              <MIcon name="phone_missed" size={48} className="empty-icon-material" />
              <h3>Không tìm thấy cuộc gọi</h3>
              <p>{loadError ? 'Kiểm tra kết nối hệ thống rồi thử làm mới.' : 'Thử đổi bộ lọc hoặc từ khóa tìm kiếm.'}</p>
            </div>
          )}
        </div>

        {selectedCall && (
          <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-container">
              <div className="modal-header">
                <div className="modal-header-left">
                  <h2>Cuộc gọi {String(selectedCall.id || '').slice(0, 8)}</h2>
                  <div className="modal-meta">
                    <span className="modal-meta-item">
                      <MIcon name="smart_toy" size={16} className="meta-icon" /> {selectedCall.assistantName || 'Trợ lý AI'}
                    </span>
                    <span className="modal-meta-item">
                      <MIcon name="call" size={16} className="meta-icon" /> {selectedCall.customerNumber || selectedCall.phoneNumber}
                    </span>
                    <span className="modal-meta-item">
                      <MIcon name="schedule" size={16} className="meta-icon" /> {selectedCall.duration}
                    </span>
                    <span className={`modal-status ${getStatusInfo(selectedCall.status).class}`}>
                      {getStatusInfo(selectedCall.status).text}
                    </span>
                  </div>
                </div>
                <button className="modal-close" onClick={closeModal}>
                  <MIcon name="close" size={20} />
                </button>
              </div>

              <div className="modal-body">
                <div className="modal-main">
                  <div className="audio-player">
                    <div className="audio-waveform">
                      <div className="waveform-bars">
                        {waveformHeights.map((height, index) => (
                          <div key={index} className="waveform-bar" style={{ height }}></div>
                        ))}
                      </div>
                    </div>
                    <div className="audio-controls">
                      <span className="audio-time">Ghi âm: {selectedCall.recordingUrl ? 'có sẵn' : 'chưa có'}</span>
                    </div>
                    <div className="audio-actions">
                      {selectedCall.recordingUrl && (
                        <a className="btn-download" href={selectedCall.recordingUrl} target="_blank" rel="noreferrer">
                          <MIcon name="download" size={16} /> Mở ghi âm
                        </a>
                      )}
                      <button className="btn-download" onClick={copyTranscript} disabled={!selectedCall.transcript}>
                        <MIcon name="content_copy" size={16} /> Sao chép hội thoại
                      </button>
                    </div>
                  </div>

                  <div className="modal-tabs">
                    {[
                      ['summary', 'summarize', 'Tóm tắt'],
                      ['transcript', 'chat', 'Hội thoại'],
                      ['metadata', 'data_object', 'Chi tiết'],
                    ].map(([tab, icon, label]) => (
                      <button
                        key={tab}
                        className={`modal-tab ${modalTab === tab ? 'active' : ''}`}
                        onClick={() => setModalTab(tab)}
                      >
                        <MIcon name={icon} size={20} />
                        {label}
                      </button>
                    ))}
                  </div>

                  {renderTabContent()}
                </div>

                <aside className="modal-sidebar">
                  <div className="sidebar-section">
                    <h4 className="sidebar-section-title">
                      <MIcon name="info" size={16} className="sidebar-title-icon" />
                      Thông tin cuộc gọi
                    </h4>
                    <div className="sidebar-info-list">
                      <div className="sidebar-info-row">
                        <span className="sidebar-label">Trạng thái</span>
                        <span className={`sidebar-badge ${getStatusInfo(selectedCall.status).class}`}>
                          {getStatusInfo(selectedCall.status).text}
                        </span>
                      </div>
                      <div className="sidebar-info-row">
                        <span className="sidebar-label">Trạng thái hệ thống</span>
                        <span className="sidebar-value">{selectedCall.rawStatus || '-'}</span>
                      </div>
                      <div className="sidebar-info-row">
                        <span className="sidebar-label">Bắt đầu</span>
                        <span className="sidebar-value">{formatDateTime(selectedCall.startedAt || selectedCall.timestamp)}</span>
                      </div>
                      <div className="sidebar-info-row">
                        <span className="sidebar-label">Kết thúc</span>
                        <span className="sidebar-value">{formatDateTime(selectedCall.endedAt)}</span>
                      </div>
                      <div className="sidebar-info-row">
                        <span className="sidebar-label">Loại cuộc gọi</span>
                        <span className="sidebar-value">{selectedCall.type || '-'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="sidebar-section">
                    <h4 className="sidebar-section-title">
                      <MIcon name="person" size={16} className="sidebar-title-icon" />
                      Khách hàng
                    </h4>
                    <div className="sidebar-customer-card">
                      <div className="sidebar-customer-avatar">
                        <MIcon name="person" size={20} />
                      </div>
                      <div className="sidebar-customer-info">
                        <span className="sidebar-customer-name">{selectedCall.customerName || 'Khách hàng'}</span>
                        <span className="sidebar-customer-phone">{selectedCall.customerNumber || selectedCall.phoneNumber}</span>
                      </div>
                    </div>
                  </div>

                  <div className="sidebar-section">
                    <h4 className="sidebar-section-title">
                      <MIcon name="smart_toy" size={16} className="sidebar-title-icon" />
                      Trợ lý AI
                    </h4>
                    <div className="sidebar-customer-card">
                      <div className="sidebar-agent-avatar">
                        <MIcon name="smart_toy" size={20} />
                      </div>
                      <div className="sidebar-customer-info">
                        <span className="sidebar-customer-name">{selectedCall.assistantName || 'Trợ lý AI'}</span>
                        <span className="sidebar-customer-phone">{selectedCall.assistantId || 'Chưa có mã trợ lý'}</span>
                      </div>
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
