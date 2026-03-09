import { useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { mockCallHistory } from '../data/mockCallHistory'
import { IconSearch, IconAgent, IconDownload, IconCopy, IconUser, IconClose } from '../components/DashboardIcons'
import './CallHistory.css'

export default function CallHistory() {
  const [selectedCall, setSelectedCall] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
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

  const filteredCalls = mockCallHistory.filter(call => {
    const matchesStatus = filterStatus === 'all' || call.status === filterStatus
    const matchesSearch = call.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         call.phoneNumber.includes(searchQuery)
    return matchesStatus && matchesSearch
  })

  return (
    <DashboardLayout>
      <div className="call-history-container">
        <aside className="call-sidebar">
          <div className="sidebar-header">
            <h2>Lịch sử cuộc gọi</h2>
          </div>

          <div className="search-box">
            <IconSearch className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm cuộc gọi..."
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

          <div className="call-list-container">
            {filteredCalls.map((call) => {
              const statusInfo = getStatusInfo(call.status)
              return (
                <div
                  key={call.id}
                  className={selectedCall?.id === call.id ? 'call-list-item active' : 'call-list-item'}
                  onClick={() => setSelectedCall(call)}
                >
                  <div className="call-list-header">
                    <div className="call-list-info">
                      <span className="call-list-name">{call.customerName}</span>
                      <span className="call-list-agent">
                        <IconAgent className="agent-icon" /> LINH
                      </span>
                    </div>
                    <span className="call-list-duration">{call.duration}</span>
                  </div>
                  <div className="call-list-meta">
                    <span className="call-list-phone">{call.phoneNumber}</span>
                    <span className="call-list-messages">{call.messageCount || 5} tin nhắn</span>
                  </div>
                  <div className="call-list-footer">
                    <span className="call-list-date">{call.timestamp}</span>
                    <span className={`call-list-status ${statusInfo.class}`}>
                      {statusInfo.text}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </aside>

        <main className="call-detail-main">
          {selectedCall ? (
            <div className="detail-layout">
              <div className="detail-left">
                <div className="detail-header">
                  <h1>Cuộc gọi với {selectedCall.customerName}</h1>
                  <div className="detail-meta">
                    <span className="detail-meta-item">
                      <IconAgent className="agent-icon" /> LINH
                    </span>
                    <span className="detail-meta-item">{selectedCall.phoneNumber}</span>
                  </div>
                </div>

                {/* Audio Player */}
                <div className="audio-player">
                  <div className="audio-waveform">
                    <div className="waveform-bars">
                      {[...Array(50)].map((_, i) => (
                        <div 
                          key={i} 
                          className="waveform-bar"
                          style={{ height: `${Math.random() * 100}%` }}
                        ></div>
                      ))}
                    </div>
                  </div>
                  <div className="audio-controls">
                    <button className="play-button" onClick={togglePlay}>
                      {isPlaying ? '⏸' : '▶'}
                    </button>
                    <span className="audio-speed">1.0x</span>
                    <button className="audio-action">↻</button>
                    <button className="audio-action">↺</button>
                    <span className="audio-time">0:00 / {selectedCall.duration}</span>
                    <button className="audio-action">⋯</button>
                  </div>
                  <div className="audio-actions">
                    <button className="btn-download">
                      <IconDownload className="icon" /> Tải audio
                    </button>
                    <button className="btn-download">
                      <IconCopy className="icon" /> Sao chép transcript
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="detail-tabs">
                  <button
                    className={activeTab === 'overview' ? 'detail-tab active' : 'detail-tab'}
                    onClick={() => setActiveTab('overview')}
                  >
                    Tổng quan
                  </button>
                  <button
                    className={activeTab === 'transcription' ? 'detail-tab active' : 'detail-tab'}
                    onClick={() => setActiveTab('transcription')}
                  >
                    Nội dung
                  </button>
                  <button
                    className={activeTab === 'client' ? 'detail-tab active' : 'detail-tab'}
                    onClick={() => setActiveTab('client')}
                  >
                    Thông tin khách hàng
                  </button>
                </div>

                <div className="detail-content">
                {activeTab === 'overview' && (
                  <>
                    <div className="detail-section">
                      <h3 className="section-title">Tóm tắt</h3>
                      <div className="summary-box">
                        <p>{selectedCall.summary}</p>
                      </div>
                    </div>

                    <div className="detail-section">
                      <h3 className="section-title">Trạng thái cuộc gọi</h3>
                      <div className="status-grid">
                        <div className="status-item">
                          <span className="status-label">Trạng thái</span>
                          <span className={`status-badge-large ${getStatusInfo(selectedCall.status).class}`}>
                            {getStatusInfo(selectedCall.status).text}
                          </span>
                        </div>
                        <div className="status-item">
                          <span className="status-label">Kết thúc bởi</span>
                          <span className="status-value">Khách hàng</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'transcription' && selectedCall.transcript && (
                  <div className="detail-section">
                    <h3 className="section-title">Nội dung hội thoại</h3>
                    <div className="transcript-container">
                      {selectedCall.transcript.split('\n').map((line, index) => {
                        const isCustomer = line.startsWith('Khách:')
                        const isAgent = line.startsWith('LINH:')
                        const text = line.replace(/^(Khách:|LINH:)\s*/, '')
                        
                        if (!text.trim()) return null
                        
                        return (
                          <div key={index} className={isCustomer ? 'transcript-message customer' : 'transcript-message agent'}>
                            <div className="message-avatar">
                              {isCustomer ? <IconUser className="icon" /> : <IconAgent className="icon" />}
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
                  </div>
                )}

                {activeTab === 'client' && (
                  <div className="detail-section">
                    <h3 className="section-title">Thông tin khách hàng</h3>
                    <div className="client-info">
                      <div className="client-info-item">
                        <span className="client-label">Tên khách hàng</span>
                        <span className="client-value">{selectedCall.customerName}</span>
                      </div>
                      <div className="client-info-item">
                        <span className="client-label">Số điện thoại</span>
                        <span className="client-value">{selectedCall.phoneNumber}</span>
                      </div>
                      <div className="client-info-item">
                        <span className="client-label">Loại cuộc gọi</span>
                        <span className="client-value">
                          {selectedCall.type === 'inbound' ? 'Gọi đến' : 'Gọi đi'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Metadata Sidebar */}
            <aside className="metadata-sidebar">
              <div className="metadata-header">
                <h3>Metadata</h3>
                <button className="metadata-close">
                  <IconClose className="icon" />
                </button>
              </div>
              
              <div className="metadata-content">
                <div className="metadata-item">
                  <span className="metadata-label">Ngày</span>
                  <span className="metadata-value">{selectedCall.timestamp}</span>
                </div>
                
                <div className="metadata-item">
                  <span className="metadata-label">Thời lượng kết nối</span>
                  <span className="metadata-value">{selectedCall.duration}</span>
                </div>
                
                <div className="metadata-item">
                  <span className="metadata-label">Trạng thái cuộc gọi</span>
                  <span className={`metadata-badge ${getStatusInfo(selectedCall.status).class}`}>
                    {getStatusInfo(selectedCall.status).text}
                  </span>
                </div>

                <div className="metadata-item">
                  <span className="metadata-label">Kết thúc bởi</span>
                  <span className="metadata-value">Khách hàng</span>
                </div>

                <div className="metadata-item">
                  <span className="metadata-label">ID người dùng</span>
                  <span className="metadata-value text-muted">Không có ID</span>
                </div>
              </div>
            </aside>
          </div>
          ) : (
            <div className="no-selection-state">
              <div className="no-selection-icon">💬</div>
              <h3>Chọn một cuộc gọi</h3>
              <p>Chọn một cuộc gọi từ danh sách để xem chi tiết</p>
            </div>
          )}
        </main>
      </div>
    </DashboardLayout>
  )
}
