import { useEffect, useMemo, useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { deleteVoiceFile, getVoiceFiles, uploadVoiceFile } from '../services/voice'
import './KnowledgeBase.css'

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

function formatBytes(bytes) {
  const value = Number(bytes || 0)
  if (!value) return '0 KB'

  const units = ['B', 'KB', 'MB', 'GB']
  let size = value
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex += 1
  }

  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
}

function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function statusClass(status) {
  if (status === 'done') return 'status-success'
  if (status === 'processing') return 'status-warning'
  if (status === 'failed') return 'status-error'
  return 'status-muted'
}

function statusLabel(status) {
  if (status === 'done') return 'Đã xử lý'
  if (status === 'processing') return 'Đang xử lý'
  if (status === 'failed') return 'Lỗi'
  return 'Không rõ'
}

export default function KnowledgeBase() {
  const [files, setFiles] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [deletingFileId, setDeletingFileId] = useState('')
  const [loadError, setLoadError] = useState('')
  const [uploadError, setUploadError] = useState('')
  const [dataSource, setDataSource] = useState('idle')

  const loadFiles = async () => {
    setIsLoading(true)
    setLoadError('')

    try {
      const voiceFiles = await getVoiceFiles()
      setFiles(Array.isArray(voiceFiles) ? voiceFiles : [])
      setDataSource('live')
    } catch (error) {
      setFiles([])
      setDataSource('error')
      setLoadError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadFiles()
  }, [])

  const handleUpload = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setIsUploading(true)
    setUploadError('')

    try {
      const uploadedFile = await uploadVoiceFile(file)
      setFiles((currentFiles) => [uploadedFile, ...currentFiles])
      setDataSource('live')
    } catch (error) {
      setUploadError(error.message)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (file) => {
    if (!file?.id || deletingFileId) return
    const confirmed = window.confirm(`Xoa tai lieu "${file.name}" khoi knowledge base?`)
    if (!confirmed) return

    setDeletingFileId(file.id)
    setUploadError('')

    try {
      await deleteVoiceFile(file.id, file.metadata?.knowledgeBaseId)
      setFiles((currentFiles) => currentFiles.filter((currentFile) => currentFile.id !== file.id))
    } catch (error) {
      setUploadError(error.message)
    } finally {
      setDeletingFileId('')
    }
  }

  const filteredFiles = useMemo(() => files.filter((file) => {
    const query = searchQuery.toLowerCase()
    const matchesStatus = selectedStatus === 'all' || file.status === selectedStatus
    const searchable = [
      file.id,
      file.name,
      file.originalName,
      file.status,
      file.purpose,
      file.mimetype,
    ].join(' ').toLowerCase()

    return matchesStatus && searchable.includes(query)
  }), [files, searchQuery, selectedStatus])

  const totalBytes = files.reduce((sum, file) => sum + Number(file.bytes || 0), 0)
  const processedFiles = files.filter((file) => file.status === 'done').length
  const processingFiles = files.filter((file) => file.status === 'processing').length

  return (
    <DashboardLayout>
      <div className="knowledge-page">
        <div className="knowledge-header">
          <div className="knowledge-header-left">
            <h1>Kho dữ liệu</h1>
            <p className="knowledge-subtitle">Tải lên tài liệu, bảng giá, chính sách và FAQ để trợ lý AI có dữ liệu trả lời khách hàng.</p>
          </div>
          <div className="knowledge-header-actions">
            <span className={`data-source-badge ${dataSource}`}>
              {dataSource === 'live' ? 'Đã kết nối' : 'Chưa kết nối'}
            </span>
            <label className={`btn-create upload-label ${isUploading ? 'disabled' : ''}`}>
              <MIcon name={isUploading ? 'progress_activity' : 'upload'} size={20} />
              {isUploading ? 'Đang tải lên' : 'Tải tài liệu'}
              <input
                type="file"
                onChange={handleUpload}
                disabled={isUploading}
                accept=".pdf,.doc,.docx,.txt,.csv,.json,.mp3,.wav,.m4a"
              />
            </label>
            <button className="btn-upload" onClick={loadFiles} disabled={isLoading}>
              <MIcon name={isLoading ? 'progress_activity' : 'refresh'} size={20} />
              {isLoading ? 'Đang tải' : 'Làm mới'}
            </button>
          </div>
        </div>

        {loadError && (
          <div className="api-alert">
            <MIcon name="info" size={18} />
            Không thể tải kho dữ liệu: {loadError}.
          </div>
        )}

        {uploadError && (
          <div className="api-alert">
            <MIcon name="warning" size={18} />
            Không thể tải tài liệu lên: {uploadError}.
          </div>
        )}

        <div className="knowledge-stats">
          <div className="knowledge-stat-card">
            <div className="knowledge-stat-number">{files.length}</div>
            <div className="knowledge-stat-label">Tài liệu</div>
          </div>
          <div className="knowledge-stat-card">
            <div className="knowledge-stat-number">{processedFiles}</div>
            <div className="knowledge-stat-label">Đã xử lý</div>
          </div>
          <div className="knowledge-stat-card">
            <div className="knowledge-stat-number">{processingFiles}</div>
            <div className="knowledge-stat-label">Đang xử lý</div>
          </div>
          <div className="knowledge-stat-card">
            <div className="knowledge-stat-number">{formatBytes(totalBytes)}</div>
            <div className="knowledge-stat-label">Dung lượng</div>
          </div>
        </div>

        <div className="knowledge-toolbar">
          <div className="knowledge-search">
            <MIcon name="search" size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Tìm theo tên tài liệu, loại dữ liệu..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="search-input"
            />
          </div>
          <div className="knowledge-filters">
            {[
              ['all', 'Tất cả'],
              ['done', 'Đã xử lý'],
              ['processing', 'Đang xử lý'],
              ['failed', 'Lỗi'],
            ].map(([value, label]) => (
              <button
                key={value}
                className={`knowledge-filter ${selectedStatus === value ? 'active' : ''}`}
                onClick={() => setSelectedStatus(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="knowledge-grid">
          {filteredFiles.map((file) => (
            <div key={file.id} className="knowledge-card">
              <div className="knowledge-card-icon document">
                <MIcon name={file.mimetype?.startsWith('audio/') ? 'graphic_eq' : 'description'} size={28} filled />
              </div>
              <div className="knowledge-card-content">
                <h3 className="knowledge-card-title">{file.name}</h3>
                <p className="knowledge-card-desc">
                  {file.purpose || 'tài liệu'} · {file.mimetype || 'không rõ định dạng'}
                </p>
                <div className="knowledge-card-meta">
                  <span className={`call-table-status ${statusClass(file.status)}`}>{statusLabel(file.status)}</span>
                  <span className="knowledge-card-info">{formatBytes(file.bytes)}</span>
                  <span className="knowledge-card-time">{formatDate(file.updatedAt || file.createdAt)}</span>
                </div>
                <div className="knowledge-card-meta">
                  <span className="knowledge-card-info">Nội dung đã đọc: {formatBytes(file.parsedTextBytes)}</span>
                </div>
              </div>
              <div className="knowledge-card-actions">
                {file.url && (
                  <a className="card-action-btn" title="Mở tài liệu" href={file.url} target="_blank" rel="noreferrer">
                    <MIcon name="open_in_new" size={18} />
                  </a>
                )}
                {file.parsedTextUrl && (
                  <a className="card-action-btn" title="Mở nội dung đã đọc" href={file.parsedTextUrl} target="_blank" rel="noreferrer">
                    <MIcon name="article" size={18} />
                  </a>
                )}
                <button
                  type="button"
                  className="card-action-btn delete"
                  title="Xoa tai lieu"
                  onClick={() => handleDelete(file)}
                  disabled={deletingFileId === file.id}
                >
                  <MIcon name={deletingFileId === file.id ? 'progress_activity' : 'delete'} size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {!isLoading && filteredFiles.length === 0 && (
          <div className="knowledge-dropzone">
            <MIcon name="cloud_upload" size={48} className="dropzone-icon" />
            <h3>Chưa có tài liệu phù hợp</h3>
            <p>{loadError ? 'Kiểm tra kết nối hệ thống rồi thử làm mới.' : 'Tải lên tài liệu kinh doanh để trợ lý AI có thể sử dụng khi trả lời khách hàng.'}</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
