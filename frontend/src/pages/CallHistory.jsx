import { useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { mockCallHistory } from '../data/mockCallHistory'
import './CallHistory.css'

const waveformHeights = Array.from({ length: 80 }, (_, index) => {
  const value = Math.sin(index * 1.7) * 0.5 + Math.sin(index * 0.43) * 0.5
  return `${Math.round(34 + Math.abs(value) * 66)}%`
})

// Material icon helper
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

export default function CallHistory() {
  const [selectedCall, setSelectedCall] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [modalTab, setModalTab] = useState('summary')
  const [isPlaying, setIsPlaying] = useState(false)

  const getStatusInfo = (status) => {
    const statusMap = {
      completed: { text: 'Thành công', class: 'status-success' },
      transferred: { text: 'Chuyển tiếp', class: 'status-warning' },
      missed: { text: 'Nhỡ', class: 'status-error' },
    }
    return statusMap[status] || statusMap.completed
  }

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const openModal = (call) => {
    setSelectedCall(call)
    setModalTab('summary')
    setIsPlaying(false)
  }

  const closeModal = () => {
    setSelectedCall(null)
    setIsPlaying(false)
  }

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      closeModal()
    }
  }

  const filteredCalls = mockCallHistory.filter(call => {
    const matchesStatus = filterStatus === 'all' || call.status === filterStatus
    const matchesSearch = call.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      call.phoneNumber.includes(searchQuery)
    return matchesStatus && matchesSearch
  })

  const renderTabContent = () => {
    if (!selectedCall) return null

    switch (modalTab) {
      case 'summary':
        return (
          <div className="tab-content-area">
            <div className="modal-section">
              <h3 className="section-title">Tóm tắt</h3>
              <div className="summary-box">
                <p>{selectedCall.summary}</p>
              </div>
            </div>
          </div>
        )

      case 'transcript':
        return (
          <div className="tab-content-area">
            {selectedCall.transcript ? (
              <div className="transcript-container">
                {selectedCall.transcript.split('\n').map((line, index) => {
                  const isCustomer = line.startsWith('Khách:')
                  const text = line.replace(/^(Khách:|LINH:)\s*/, '')

                  if (!text.trim()) return null

                  return (
                    <div key={index} className={isCustomer ? 'transcript-message customer' : 'transcript-message agent'}>
                      <div className="message-avatar">
                        <MIcon name={isCustomer ? 'person' : 'smart_toy'} size={18} />
                      </div>
                      <div className="message-content">
                        <div className="message-header">
                          <span className="message-sender">
                            {isCustomer ? selectedCall.customerName : 'LINH'}
                          </span>
                        </div>
                        <div className="message-text">{text}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="empty-transcript">
                <MIcon name="chat_bubble_outline" size={40} className="empty-icon-material" />
                <p>Không có nội dung hội thoại</p>
              </div>
            )}
          </div>
        )

      case 'customer':
        return (
          <div className="tab-content-area">
            <div className="customer-detail-card">
              <div className="customer-detail-header">
                <div className="customer-detail-avatar">
                  <MIcon name="person" size={32} />
                </div>
                <div className="customer-detail-info">
                  <h3>{selectedCall.customerName}</h3>
                  <p>{selectedCall.phoneNumber}</p>
                </div>
              </div>
              <div className="customer-detail-stats">
                <div className="customer-stat-item">
                  <span className="customer-stat-label">Tổng cuộc gọi</span>
                  <span className="customer-stat-value">12</span>
                </div>
                <div className="customer-stat-item">
                  <span className="customer-stat-label">Lần gọi gần nhất</span>
                  <span className="customer-stat-value">{selectedCall.timestamp}</span>
                </div>
                <div className="customer-stat-item">
                  <span className="customer-stat-label">Thời gian TB</span>
                  <span className="customer-stat-value">4:20</span>
                </div>
                <div className="customer-stat-item">
                  <span className="customer-stat-label">Tỷ lệ thành công</span>
                  <span className="customer-stat-value highlight">92%</span>
                </div>
              </div>
              <div className="customer-detail-section">
                <h4>Ghi chú</h4>
                <p className="customer-note">Khách hàng thường xuyên, quan tâm đến các tuyến xe liên tỉnh. Ưu tiên ghế VIP và thanh toán online.</p>
              </div>
              <div className="customer-detail-section">
                <h4>Lịch sử tương tác</h4>
                <div className="customer-history-list">
                  <div className="customer-history-item">
                    <div className="history-dot success"></div>
                    <div className="history-content">
                      <span className="history-text">Đặt vé thành công - Hà Nội → Hải Phòng</span>
                      <span className="history-time">2 ngày trước</span>
                    </div>
                  </div>
                  <div className="customer-history-item">
                    <div className="history-dot success"></div>
                    <div className="history-content">
                      <span className="history-text">Hỏi thông tin tuyến xe</span>
                      <span className="history-time">5 ngày trước</span>
                    </div>
                  </div>
                  <div className="customer-history-item">
                    <div className="history-dot warning"></div>
                    <div className="history-content">
                      <span className="history-text">Yêu cầu đổi vé</span>
                      <span className="history-time">1 tuần trước</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <DashboardLayout>
      <div className="call-history-page">
        {/* Page Header */}
        <div className="page-header">
          <div className="page-header-left">
            <h1>Lịch sử cuộc gọi</h1>
            <span className="call-count">{filteredCalls.length} cuộc gọi</span>
          </div>
        </div>

        {/* Toolbar */}
        <div className="toolbar">
          <div className="search-box">
            <MIcon name="search" size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, số điện thoại..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-tabs">
            <button
              className={filterStatus === 'all' ? 'filter-tab active' : 'filter-tab'}
              onClick={() => setFilterStatus('all')}
            >
              Tất cả
            </button>
            <button
              className={filterStatus === 'completed' ? 'filter-tab active' : 'filter-tab'}
              onClick={() => setFilterStatus('completed')}
            >
              Thành công
            </button>
            <button
              className={filterStatus === 'transferred' ? 'filter-tab active' : 'filter-tab'}
              onClick={() => setFilterStatus('transferred')}
            >
              Chuyển tiếp
            </button>
            <button
              className={filterStatus === 'missed' ? 'filter-tab active' : 'filter-tab'}
              onClick={() => setFilterStatus('missed')}
            >
              Nhỡ
            </button>
          </div>
        </div>

        {/* Call Table */}
        <div className="call-table-wrapper">
          <table className="call-table">
            <thead>
              <tr>
                <th>Khách hàng</th>
                <th>Số điện thoại</th>
                <th>Agent</th>
                <th>Thời lượng</th>
                <th>Tin nhắn</th>
                <th>Trạng thái</th>
                <th>Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {filteredCalls.map((call) => {
                const statusInfo = getStatusInfo(call.status)
                return (
                  <tr
                    key={call.id}
                    className="call-table-row"
                    onClick={() => openModal(call)}
                  >
                    <td>
                      <div className="cell-customer">
                        <div className="customer-avatar">
                          <MIcon name="person" size={20} className="avatar-icon" />
                        </div>
                        <span className="customer-name">{call.customerName}</span>
                      </div>
                    </td>
                    <td>
                      <span className="cell-phone">{call.phoneNumber}</span>
                    </td>
                    <td>
                      <div className="cell-agent">
                        <MIcon name="smart_toy" size={18} className="agent-icon-small" />
                        <span>LINH</span>
                      </div>
                    </td>
                    <td>
                      <span className="cell-duration">{call.duration}</span>
                    </td>
                    <td>
                      <span className="cell-messages">{call.messageCount || 0} tin nhắn</span>
                    </td>
                    <td>
                      <span className={`call-table-status ${statusInfo.class}`}>
                        {statusInfo.text}
                      </span>
                    </td>
                    <td>
                      <span className="cell-date">{call.timestamp}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {filteredCalls.length === 0 && (
            <div className="empty-state">
              <MIcon name="phone_missed" size={48} className="empty-icon-material" />
              <h3>Không tìm thấy cuộc gọi</h3>
              <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
          )}
        </div>

        {/* Detail Modal */}
        {selectedCall && (
          <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-container">
              {/* Modal Header */}
              <div className="modal-header">
                <div className="modal-header-left">
                  <h2>Cuộc gọi với {selectedCall.customerName}</h2>
                  <div className="modal-meta">
                    <span className="modal-meta-item">
                      <MIcon name="smart_toy" size={16} className="meta-icon" /> LINH
                    </span>
                    <span className="modal-meta-item">
                      <MIcon name="call" size={16} className="meta-icon" /> {selectedCall.phoneNumber}
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

              {/* Modal Body - Two Column Layout */}
              <div className="modal-body">
                {/* Left Column */}
                <div className="modal-main">
                  {/* Audio Player - ALWAYS visible */}
                  <div className="audio-player">
                    <div className="audio-waveform">
                      <div className="waveform-bars">
                        {waveformHeights.map((height, i) => (
                          <div
                            key={i}
                            className="waveform-bar"
                            style={{ height }}
                          ></div>
                        ))}
                      </div>
                    </div>
                    <div className="audio-controls">
                      <button className="play-button" onClick={togglePlay}>
                        <MIcon name={isPlaying ? 'pause' : 'play_arrow'} size={22} filled />
                      </button>
                      <span className="audio-speed">1.0x</span>
                      <button className="audio-action">
                        <MIcon name="forward_10" size={20} />
                      </button>
                      <button className="audio-action">
                        <MIcon name="replay_10" size={20} />
                      </button>
                      <span className="audio-time">0:00 / {selectedCall.duration}</span>
                      <button className="audio-action">
                        <MIcon name="more_horiz" size={20} />
                      </button>
                    </div>
                    <div className="audio-actions">
                      <button className="btn-download">
                        <MIcon name="download" size={16} /> Tải audio
                      </button>
                      <button className="btn-download">
                        <MIcon name="content_copy" size={16} /> Sao chép transcript
                      </button>
                    </div>
                  </div>

                  {/* Tab Navigation - BELOW audio */}
                  <div className="modal-tabs">
                    <button
                      className={`modal-tab ${modalTab === 'summary' ? 'active' : ''}`}
                      onClick={() => setModalTab('summary')}
                    >
                      <MIcon name="summarize" size={20} />
                      Tóm tắt
                    </button>
                    <button
                      className={`modal-tab ${modalTab === 'transcript' ? 'active' : ''}`}
                      onClick={() => setModalTab('transcript')}
                    >
                      <MIcon name="chat" size={20} />
                      Nội dung cuộc gọi
                    </button>
                    <button
                      className={`modal-tab ${modalTab === 'customer' ? 'active' : ''}`}
                      onClick={() => setModalTab('customer')}
                    >
                      <MIcon name="person" size={20} />
                      Thông tin khách hàng
                    </button>
                  </div>

                  {/* Tab Content */}
                  {renderTabContent()}
                </div>

                {/* Right Column - Call Info Sidebar */}
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
                        <span className="sidebar-label">Thời gian</span>
                        <span className="sidebar-value">{selectedCall.timestamp}</span>
                      </div>
                      <div className="sidebar-info-row">
                        <span className="sidebar-label">Thời lượng</span>
                        <span className="sidebar-value">{selectedCall.duration}</span>
                      </div>
                      <div className="sidebar-info-row">
                        <span className="sidebar-label">Số tin nhắn</span>
                        <span className="sidebar-value">{selectedCall.messageCount || 0}</span>
                      </div>
                      <div className="sidebar-info-row">
                        <span className="sidebar-label">Kết thúc bởi</span>
                        <span className="sidebar-value">Khách hàng</span>
                      </div>
                      <div className="sidebar-info-row">
                        <span className="sidebar-label">Loại cuộc gọi</span>
                        <span className="sidebar-value">
                          {selectedCall.type === 'inbound' ? 'Gọi đến' : 'Gọi đi'}
                        </span>
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
                        <span className="sidebar-customer-name">{selectedCall.customerName}</span>
                        <span className="sidebar-customer-phone">{selectedCall.phoneNumber}</span>
                      </div>
                    </div>
                  </div>

                  <div className="sidebar-section">
                    <h4 className="sidebar-section-title">
                      <MIcon name="smart_toy" size={16} className="sidebar-title-icon" />
                      Agent
                    </h4>
                    <div className="sidebar-customer-card">
                      <div className="sidebar-agent-avatar">
                        <MIcon name="smart_toy" size={20} />
                      </div>
                      <div className="sidebar-customer-info">
                        <span className="sidebar-customer-name">LINH</span>
                        <span className="sidebar-customer-phone">AI Voice Agent</span>
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
