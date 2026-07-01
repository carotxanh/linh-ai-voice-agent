import { useEffect, useMemo, useRef, useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { getVoiceCall, getVoiceCalls } from '../services/voice'
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
  return `$${Number(value || 0).toFixed(4)}`
}

function getOutcome(call) {
  if (call.successful === true) return { text: 'Thành công', className: 'outcome-success', icon: 'check_circle' }
  if (call.reviewRequired) return { text: 'Cần xem lại', className: 'outcome-warning', icon: 'priority_high' }
  if (call.successful === false) return { text: 'Chưa đạt', className: 'outcome-warning', icon: 'warning' }
  return { text: 'Chưa đánh giá', className: 'outcome-muted', icon: 'help' }
}

function hasVietnameseText(value = '') {
  return /[ᡣ⧥鹻)סi]/i.test(value)
}

function vietnamizeSummary(value) {
  if (!value) return 'Cuộc gọi ny cha c tm tt t Retell.'
  if (hasVietnameseText(value)) return value

  const replacements = [
    [/\bthe agent\b/gi, 'LinhVoice'],
    [/\bagent\b/gi, 'LinhVoice'],
    [/\bthe user\b/gi, 'khch hng'],
    [/\bthe customer\b/gi, 'khch hng'],
    [/\buser\b/gi, 'khch hng'],
    [/\bcustomer\b/gi, 'khch hng'],
    [/\bcalled\b/gi, ' gi'],
    [/\bspoke with\b/gi, ' trao i vi'],
    [/\basked\b/gi, ' hi'],
    [/\banswered\b/gi, ' tr li'],
    [/\bsaid\b/gi, 'cho bit'],
    [/\bagreed\b/gi, 'ng '],
    [/\bscheduled\b/gi, ' t lch'],
    [/\bappointment\b/gi, 'lch hn'],
    [/\bpurchase inquiry\b/gi, 'nhu cu mua hng'],
    [/\bpreference\b/gi, 'nhu cu u tin'],
    [/\bwould like to\b/gi, 'mun'],
    [/\bbook\b/gi, 't'],
    [/\bnext monday\b/gi, 'th Hai ti'],
    [/\bhappily\b/gi, 'vui v'],
  ]

  return replacements.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), value)
}

function transcriptLines(call) {
  if (Array.isArray(call?.transcriptTurns) && call.transcriptTurns.length > 0) {
    return call.transcriptTurns.map((turn, index) => ({
      id: turn.id || `${turn.speakerType}-${index}`,
      speaker: turn.speaker || (turn.speakerType === 'customer' ? 'Khách hàng' : 'LinhVoice'),
      text: turn.text,
      isUser: turn.speakerType === 'customer',
    })).filter((line) => line.text)
  }

  if (!call?.transcript) return []

  return call.transcript
    .split('\n')
    .map((line, index) => {
      const match = line.match(/^(User|Customer|Caller|Assistant|Agent|AI|LINH):\s*(.*)$/i)
      if (!match) return { id: `line-${index}`, speaker: 'Transcript', text: line.trim(), isUser: false }
      const isUser = /user|customer|caller/i.test(match[1])
      return {
        id: `line-${index}`,
        speaker: isUser ? 'Khách hàng' : 'LinhVoice',
        text: match[2].trim(),
        isUser,
      }
    })
    .filter((line) => line.text)
}

function buildTranscriptText(call) {
  return transcriptLines(call).map((line) => `${line.isUser ? 'Khách hàng' : 'LinhVoice'}: ${line.text}`).join('\n')
}

function csvCell(value) {
  const text = String(value ?? '').replace(/\r?\n/g, ' ')
  return `"${text.replace(/"/g, '""')}"`
}

function downloadCsv(filename, rows) {
  const csv = rows.map((row) => row.map(csvCell).join(',')).join('\n')
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export default function CallHistory() {
  const audioRef = useRef(null)
  const [calls, setCalls] = useState([])
  const [selectedCall, setSelectedCall] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [modalTab, setModalTab] = useState('summary')
  const [isRecordingPlaying, setIsRecordingPlaying] = useState(false)
  const [recordingProgress, setRecordingProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isCallDetailLoading, setIsCallDetailLoading] = useState(false)
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
    const matchesStatus = filterStatus === 'all'
      || call.status === filterStatus
      || (filterStatus === 'review' && call.reviewRequired)
      || (filterStatus === 'successful' && call.successful === true)
    const searchable = [
      call.id,
      call.phoneNumber,
      call.customerNumber,
      call.assistantName,
      call.type,
      call.endedReason,
      call.rawStatus,
      call.summary,
      call.sentimentLabel,
      call.intent,
    ].join(' ').toLowerCase()

    return matchesStatus && searchable.includes(query)
  }), [calls, filterStatus, searchQuery])

  const openModal = async (call) => {
    setSelectedCall(call)
    setModalTab('summary')
    setIsRecordingPlaying(false)
    setRecordingProgress(0)

    if (!call?.id) return
    setIsCallDetailLoading(true)
    try {
      const detail = await getVoiceCall(call.id)
      setSelectedCall({ ...call, ...detail })
    } catch (error) {
      setLoadError(error.message)
    } finally {
      setIsCallDetailLoading(false)
    }
  }

  const closeModal = () => {
    if (audioRef.current) {
      audioRef.current.pause()
    }
    setIsRecordingPlaying(false)
    setRecordingProgress(0)
    setSelectedCall(null)
  }

  const handleOverlayClick = (event) => {
    if (event.target.classList.contains('modal-overlay')) {
      closeModal()
    }
  }

  const copyTranscript = async () => {
    if (!selectedCall) return
    const text = buildTranscriptText(selectedCall)
    if (!text) return
    await navigator.clipboard.writeText(text)
  }

  const toggleRecording = async () => {
    const audio = audioRef.current
    if (!audio) return

    if (audio.paused) {
      await audio.play()
      setIsRecordingPlaying(true)
    } else {
      audio.pause()
      setIsRecordingPlaying(false)
    }
  }

  const updateRecordingProgress = () => {
    const audio = audioRef.current
    if (!audio?.duration) {
      setRecordingProgress(0)
      return
    }
    setRecordingProgress(Math.min(100, (audio.currentTime / audio.duration) * 100))
  }

  const renderSummaryTab = () => {
    const outcome = getOutcome(selectedCall)
    return (
      <div className="tab-content-area">
        <div className="insight-grid">
          <div className={`insight-card ${outcome.className}`}>
            <MIcon name={outcome.icon} size={22} />
            <div>
              <span>Kết quả</span>
              <strong>{outcome.text}</strong>
            </div>
          </div>
          <div className="insight-card">
            <MIcon name="mood" size={22} />
            <div>
              <span>Cảm xúc khách</span>
              <strong>{selectedCall.sentimentLabel || 'Chưa rõ'}</strong>
            </div>
          </div>
          <div className="insight-card">
            <MIcon name="category" size={22} />
            <div>
              <span>Nhóm nhu cầu</span>
              <strong>{selectedCall.intent || 'Chưa phân loại'}</strong>
            </div>
          </div>
        </div>

        <div className="modal-section">
          <h3 className="section-title">Tóm tắt dễ hiểu</h3>
          <div className="summary-box">
            <p>{vietnamizeSummary(selectedCall.summary)}</p>
          </div>
        </div>

        <div className="customer-detail-stats">
          <div className="customer-stat-item">
            <span className="customer-stat-label">Chi phí</span>
            <span className="customer-stat-value">{formatCost(selectedCall.cost)}</span>
          </div>
          <div className="customer-stat-item">
            <span className="customer-stat-label">Lượt trao đổi</span>
            <span className="customer-stat-value">{selectedCall.messageCount || 0}</span>
          </div>
          <div className="customer-stat-item">
            <span className="customer-stat-label">Thời lượng</span>
            <span className="customer-stat-value">{selectedCall.duration}</span>
          </div>
          <div className="customer-stat-item">
            <span className="customer-stat-label">Độ trễ TB</span>
            <span className="customer-stat-value">{selectedCall.averageLatencyMs || 0} ms</span>
          </div>
        </div>
      </div>
    )
  }

  const renderTranscriptTab = () => {
    const lines = transcriptLines(selectedCall)

    return (
      <div className="tab-content-area">
        {lines.length > 0 ? (
          <div className="transcript-container">
            {lines.map((line) => (
              <div key={line.id} className={line.isUser ? 'transcript-message customer' : 'transcript-message agent'}>
                <div className="message-avatar">
                  <MIcon name={line.isUser ? 'person' : 'smart_toy'} size={18} />
                </div>
                <div className="message-content">
                  <div className="message-header">
                    <span className="message-sender">{line.isUser ? 'Khách hàng' : 'LinhVoice'}</span>
                  </div>
                  <div className="message-text">{line.text}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-transcript">
            <MIcon name="chat_bubble_outline" size={40} className="empty-icon-material" />
            <p>Cuộc gọi nay chua co noi dung hoi thoai.</p>
          </div>
        )}
      </div>
    )
  }

  const renderCostTab = () => (
    <div className="tab-content-area">
      <div className="customer-detail-card">
        <div className="customer-detail-section">
          <h4>Chi phí theo hang muc</h4>
          <div className="sidebar-info-list">
            {selectedCall.costProducts?.length > 0 ? selectedCall.costProducts.map((item) => (
              <div className="sidebar-info-row" key={item.name}>
                <span className="sidebar-label">{item.name}</span>
                <span className="sidebar-value">{formatCost(item.cost)}</span>
              </div>
            )) : (
              <p className="customer-note">Chưa có chi phí chi tiết cho cuộc gọi này.</p>
            )}
          </div>
        </div>
        <div className="customer-detail-section">
          <h4>Liên kết Retell</h4>
          <div className="sidebar-info-list">
            <div className="sidebar-info-row">
              <span className="sidebar-label">Bản ghi âm</span>
              <span className="sidebar-value">{selectedCall.recordingUrl ? 'Có sẵn' : 'Chưa có'}</span>
            </div>
            <div className="sidebar-info-row">
              <span className="sidebar-label">Public log</span>
              <span className="sidebar-value">{selectedCall.publicLogUrl ? 'Có sẵn' : 'Chưa có'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderTechnicalTab = () => (
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
              <span className="sidebar-label">Hướng gọi</span>
              <span className="sidebar-value">{selectedCall.direction || '-'}</span>
            </div>
            <div className="sidebar-info-row">
              <span className="sidebar-label">Lý do kết thúc</span>
              <span className="sidebar-value">{selectedCall.endedReason || '-'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderTabContent = () => {
    if (!selectedCall) return null
    if (modalTab === 'summary') return renderSummaryTab()
    if (modalTab === 'transcript') return renderTranscriptTab()
    if (modalTab === 'cost') return renderCostTab()
    return renderTechnicalTab()
  }

  const handleExportExcel = () => {
    const headers = [
      'Ma cuoc goi',
      'Ket qua',
      'Trang thai',
      'LinhVoice',
      'Khach hang',
      'So dien thoai',
      'Tom tat',
      'Thoi luong',
      'Chi phi',
      'Bat dau',
      'Ket thuc',
      'Ly do ket thuc',
    ]
    const rows = filteredCalls.map((call) => {
      const outcome = getOutcome(call)
      return [
        call.id,
        outcome.text,
        getStatusInfo(call.status).text,
        call.assistantName || 'LinhVoice',
        call.customerName || '',
        call.customerNumber || call.phoneNumber || '',
        call.summary ? vietnamizeSummary(call.summary) : '',
        call.duration || '',
        formatCost(call.cost),
        formatDateTime(call.startedAt || call.timestamp),
        formatDateTime(call.endedAt),
        call.endedReason || '',
      ]
    })
    const date = new Date().toISOString().slice(0, 10)
    downloadCsv(`linhvoice-call-history-${date}.csv`, [headers, ...rows])
  }

  return (
    <DashboardLayout>
      <div className="call-history-page">
        <div className="page-header">
          <div className="page-header-left">
            <h1>Lịch sử cuộc gọi</h1>
            <span className="call-count">{filteredCalls.length} cuộc gọi</span>
            <span className={`data-source-badge ${dataSource}`}>
              {dataSource === 'live' ? 'Đã kết nối Retell' : 'Chưa kết nối'}
            </span>
          </div>
          <div className="page-header-actions">
            <button className="btn-export" onClick={handleExportExcel} disabled={filteredCalls.length === 0}>
              <MIcon name="download" size={18} />
              Xuất Excel
            </button>
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
              placeholder="Tìm số điện thoại, LinhVoice, tóm tắt, cảm xúc..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-tabs">
            {[
              ['all', 'Tất cả'],
              ['successful', 'Thành công'],
              ['review', 'Cần xem lại'],
              ['completed', 'Hoàn tất'],
              ['active', 'Đang xử lý'],
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
                <th>Kết quả</th>
                <th>LinhVoice</th>
                <th>Khách hàng</th>
                <th>Tóm tắt</th>
                <th>Thời lượng</th>
                <th>Chi phí</th>
                <th>Bắt đầu</th>
              </tr>
            </thead>
            <tbody>
              {filteredCalls.map((call) => {
                const outcome = getOutcome(call)
                return (
                  <tr key={call.id} className="call-table-row" onClick={() => openModal(call)}>
                    <td>
                      <span className="cell-phone">{String(call.id || '').slice(0, 12) || '-'}</span>
                      <span className="cell-subtle">{call.type || '-'}</span>
                    </td>
                    <td>
                      <span className={`call-outcome ${outcome.className}`}>
                        <MIcon name={outcome.icon} size={15} />
                        {outcome.text}
                      </span>
                    </td>
                    <td>
                      <div className="cell-agent">
                        <MIcon name="smart_toy" size={18} className="agent-icon-small" />
                        <span>{call.assistantName || 'LinhVoice'}</span>
                      </div>
                    </td>
                    <td>
                      <span className="cell-phone">{call.customerNumber || call.phoneNumber || '-'}</span>
                    </td>
                    <td>
                      <span className="cell-summary">{call.summary ? vietnamizeSummary(call.summary) : (call.endedReason || '-')}</span>
                    </td>
                    <td>
                      <span className="cell-duration">{call.duration}</span>
                    </td>
                    <td>
                      <span className="cell-duration">{formatCost(call.cost)}</span>
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
              <h3>Đang tải lich su cuộc gọi</h3>
              <p>Đang lấy dữ liệu mới nhất từ Retell.</p>
            </div>
          )}

          {!isLoading && filteredCalls.length === 0 && (
            <div className="empty-state">
              <MIcon name="phone_missed" size={48} className="empty-icon-material" />
              <h3>Không tìm thấy cuộc gọi</h3>
              <p>{loadError ? 'Kiểm tra kết nối Retell rồi thử làm mới.' : 'Thử đổi bộ lọc hoặc từ khóa tìm kiếm.'}</p>
            </div>
          )}
        </div>

        {selectedCall && (
          <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-container">
              <div className="modal-header">
                <div className="modal-header-left">
                  <h2>Cuộc gọi {String(selectedCall.id || '').slice(0, 12)}</h2>
                  <div className="modal-meta">
                    <span className="modal-meta-item">
                      <MIcon name="smart_toy" size={16} className="meta-icon" /> {selectedCall.assistantName || 'LinhVoice'}
                    </span>
                    <span className="modal-meta-item">
                      <MIcon name="call" size={16} className="meta-icon" /> {selectedCall.customerNumber || selectedCall.phoneNumber || '-'}
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
                    {selectedCall.recordingUrl ? (
                      <div className="recording-player">
                        <audio
                          ref={audioRef}
                          className="recording-audio-hidden"
                          preload="metadata"
                          src={selectedCall.recordingUrl}
                          onEnded={() => setIsRecordingPlaying(false)}
                          onPause={() => setIsRecordingPlaying(false)}
                          onPlay={() => setIsRecordingPlaying(true)}
                          onTimeUpdate={updateRecordingProgress}
                          onLoadedMetadata={updateRecordingProgress}
                        >
                          Trình duyệt của bạn không hỗ trợ nghe ghi âm trực tiếp.
                        </audio>
                        <button
                          type="button"
                          className={`audio-waveform waveform-button ${isRecordingPlaying ? 'is-playing' : ''}`}
                          onClick={toggleRecording}
                          style={{ '--recording-progress': `${recordingProgress}%` }}
                          aria-label={isRecordingPlaying ? 'Tạm dừng ghi âm' : 'Phát ghi âm'}
                        >
                          <span className="waveform-progress-fill"></span>
                          <span className="waveform-scan-line"></span>
                          <span className="waveform-play-indicator">
                            <MIcon name={isRecordingPlaying ? 'pause' : 'play_arrow'} size={22} filled />
                          </span>
                          <div className="waveform-bars">
                            {waveformHeights.map((height, index) => (
                              <div
                                key={index}
                                className="waveform-bar"
                                style={{ height, '--bar-index': index }}
                              ></div>
                            ))}
                          </div>
                          <span className="waveform-status">{isRecordingPlaying ? 'Đang phát' : 'Bấm để nghe'}</span>
                        </button>
                      </div>
                    ) : (
                      <div className="recording-empty">
                        <MIcon name="graphic_eq" size={28} />
                        <div>
                          <strong>Chưa có ghi am</strong>
                          <span>Retell sẽ trả recording khi cuộc gọi đã xử lý xong.</span>
                        </div>
                      </div>
                    )}
                    <div className="audio-actions">
                      {selectedCall.recordingUrl && (
                        <a className="btn-download" href={selectedCall.recordingUrl} target="_blank" rel="noreferrer">
                          <MIcon name="open_in_new" size={16} /> Mở tab mới
                        </a>
                      )}
                      {selectedCall.publicLogUrl && (
                        <a className="btn-download" href={selectedCall.publicLogUrl} target="_blank" rel="noreferrer">
                          <MIcon name="receipt_long" size={16} /> Log Retell
                        </a>
                      )}
                      <button className="btn-download" onClick={copyTranscript} disabled={transcriptLines(selectedCall).length === 0}>
                        <MIcon name="content_copy" size={16} /> Sao chép hội thoại
                      </button>
                    </div>
                  </div>

                  <div className="modal-tabs">
                    {[
                      ['summary', 'summarize', 'Tóm tắt'],
                      ['transcript', 'chat', 'Hội thoại'],
                      ['cost', 'payments', 'Chi phí'],
                      ['metadata', 'data_object', 'Kỹ thuật'],
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
                      Thông tin
                    </h4>
                    <div className="sidebar-info-list">
                      <div className="sidebar-info-row">
                        <span className="sidebar-label">Trạng thái</span>
                        <span className={`sidebar-badge ${getStatusInfo(selectedCall.status).class}`}>
                          {getStatusInfo(selectedCall.status).text}
                        </span>
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
                        <span className="sidebar-label">Từ số</span>
                        <span className="sidebar-value">{selectedCall.fromNumber || '-'}</span>
                      </div>
                      <div className="sidebar-info-row">
                        <span className="sidebar-label">Đến số</span>
                        <span className="sidebar-value">{selectedCall.toNumber || '-'}</span>
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
                        <span className="sidebar-customer-phone">{selectedCall.customerNumber || selectedCall.phoneNumber || '-'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="sidebar-section">
                    <h4 className="sidebar-section-title">
                      <MIcon name="smart_toy" size={16} className="sidebar-title-icon" />
                      LinhVoice
                    </h4>
                    <div className="sidebar-customer-card">
                      <div className="sidebar-agent-avatar">
                        <MIcon name="smart_toy" size={20} />
                      </div>
                      <div className="sidebar-customer-info">
                        <span className="sidebar-customer-name">{selectedCall.assistantName || 'LinhVoice'}</span>
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
