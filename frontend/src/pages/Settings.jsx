import { useEffect, useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import {
  getVapiAssistants,
  getVapiPhoneNumbers,
  updateVapiAssistant,
  updateVapiPhoneNumber,
} from '../services/vapi'
import './Settings.css'

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

export default function Settings() {
  const [activeSection, setActiveSection] = useState('strategy')
  const [assistants, setAssistants] = useState([])
  const [phoneNumbers, setPhoneNumbers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [saveMessage, setSaveMessage] = useState('')

  const sections = [
    { id: 'strategy', icon: 'account_tree', label: 'Cách thiết lập' },
    { id: 'assistants', icon: 'smart_toy', label: 'Trợ lý AI' },
    { id: 'phoneNumbers', icon: 'settings_phone', label: 'Hotline' },
  ]

  const loadSettingsData = async () => {
    setIsLoading(true)
    setLoadError('')

    try {
      const [vapiAssistants, vapiPhoneNumbers] = await Promise.all([
        getVapiAssistants(100),
        getVapiPhoneNumbers(100),
      ])
      setAssistants(Array.isArray(vapiAssistants) ? vapiAssistants : [])
      setPhoneNumbers(Array.isArray(vapiPhoneNumbers) ? vapiPhoneNumbers : [])
    } catch (error) {
      setAssistants([])
      setPhoneNumbers([])
      setLoadError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadSettingsData()
  }, [])

  const handleAssistantFieldChange = (assistantId, field, value) => {
    setAssistants((currentAssistants) => currentAssistants.map((assistant) => (
      assistant.id === assistantId ? { ...assistant, [field]: value } : assistant
    )))
  }

  const handleSaveAssistant = async (assistant) => {
    setIsSaving(true)
    setSaveMessage('')

    try {
      const updatedAssistant = await updateVapiAssistant(assistant.id, {
        name: assistant.name,
        firstMessage: assistant.firstMessage,
        endCallMessage: assistant.endCallMessage,
      })
      setAssistants((currentAssistants) => currentAssistants.map((item) => (
        item.id === assistant.id ? updatedAssistant : item
      )))
      setSaveMessage('Đã cập nhật trợ lý AI.')
    } catch (error) {
      setSaveMessage(`Không thể cập nhật trợ lý AI: ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handlePhoneAssistantChange = async (phoneNumberId, assistantId) => {
    setIsSaving(true)
    setSaveMessage('')

    try {
      const updatedPhoneNumber = await updateVapiPhoneNumber(phoneNumberId, {
        assistantId: assistantId || null,
      })
      setPhoneNumbers((currentPhoneNumbers) => currentPhoneNumbers.map((item) => (
        item.id === phoneNumberId ? updatedPhoneNumber : item
      )))
      setSaveMessage('Đã cập nhật hotline.')
    } catch (error) {
      setSaveMessage(`Không thể cập nhật hotline: ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="settings-page">
        <div className="settings-header">
          <h1>Thiết lập LinhVoice</h1>
          <p className="settings-subtitle">Cấu hình trợ lý AI, hotline và cách tổ chức dữ liệu cho doanh nghiệp.</p>
        </div>

        {loadError && (
          <div className="api-alert">
            <MIcon name="info" size={18} />
            Không thể tải cấu hình hiện tại: {loadError}.
          </div>
        )}

        {saveMessage && (
          <div className={saveMessage.startsWith('Không') ? 'api-alert' : 'api-success'}>
            <MIcon name={saveMessage.startsWith('Không') ? 'warning' : 'check_circle'} size={18} />
            {saveMessage}
          </div>
        )}

        <div className="settings-layout">
          <nav className="settings-nav">
            {sections.map((section) => (
              <button
                key={section.id}
                className={`settings-nav-item ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => setActiveSection(section.id)}
              >
                <MIcon
                  name={section.icon}
                  size={22}
                  filled={activeSection === section.id}
                  className="settings-nav-icon"
                />
                <span>{section.label}</span>
              </button>
            ))}
          </nav>

          <div className="settings-content">
            {activeSection === 'strategy' && (
              <div className="settings-section">
                <h2>Cách tổ chức trợ lý AI</h2>
                <p className="settings-section-desc">Thiết lập theo nghiệp vụ để chủ doanh nghiệp dễ quản lý, tránh tạo quá nhiều trợ lý không cần thiết.</p>

                <div className="settings-group">
                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>Tạo trợ lý theo vai trò kinh doanh</h3>
                      <p>Nên có trợ lý riêng cho Sale, CSKH, Đặt lịch, Thu hồi công nợ hoặc từng chi nhánh nếu kịch bản và dữ liệu khác nhau.</p>
                    </div>
                    <span className="data-source-badge vapi">Khuyến nghị</span>
                  </div>
                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>Không tạo trợ lý theo từng nhân viên</h3>
                      <p>Nhân viên nên dùng tài khoản riêng để vận hành cùng một trợ lý. Chỉ tách trợ lý khi kiến thức, giọng nói, hotline hoặc quy trình thật sự khác.</p>
                    </div>
                    <span className="data-source-badge">Dễ quản lý</span>
                  </div>
                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>Tài khoản dành cho người vận hành</h3>
                      <p>Chủ doanh nghiệp, quản lý, trưởng sale và trưởng CSKH nên có tài khoản riêng để phân quyền và theo dõi trách nhiệm.</p>
                    </div>
                    <span className="data-source-badge">Phân quyền</span>
                  </div>
                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>Tách dữ liệu theo chủ đề</h3>
                      <p>Bảng giá, chính sách, FAQ và danh mục sản phẩm nên là các tài liệu riêng để dễ cập nhật và kiểm tra khi có lỗi.</p>
                    </div>
                    <span className="data-source-badge">Kho dữ liệu</span>
                  </div>
                </div>

                <div className="settings-actions">
                  <button className="btn-save" onClick={loadSettingsData} disabled={isLoading}>
                    <MIcon name={isLoading ? 'progress_activity' : 'sync'} size={18} />
                    {isLoading ? 'Đang cập nhật' : 'Cập nhật cấu hình'}
                  </button>
                </div>
              </div>
            )}

            {activeSection === 'assistants' && (
              <div className="settings-section">
                <h2>Trợ lý AI</h2>
                <p className="settings-section-desc">Đặt tên trợ lý và lời chào đầu cuộc gọi sao cho phù hợp với thương hiệu doanh nghiệp.</p>

                <div className="settings-group">
                  {assistants.map((assistant) => (
                    <div className="setting-item" key={assistant.id}>
                      <div className="setting-info">
                        <input
                          type="text"
                          className="setting-input setting-inline-input"
                          value={assistant.name || ''}
                          onChange={(event) => handleAssistantFieldChange(assistant.id, 'name', event.target.value)}
                        />
                        <p>{assistant.id}</p>
                        <textarea
                          className="setting-textarea"
                          value={assistant.firstMessage || ''}
                          onChange={(event) => handleAssistantFieldChange(assistant.id, 'firstMessage', event.target.value)}
                          placeholder="Lời chào đầu cuộc gọi..."
                        />
                      </div>
                      <div className="setting-stack">
                        <span>Mô hình hội thoại: {assistant.modelName || '-'}</span>
                        <span>Giọng nói: {assistant.voiceProvider || '-'}</span>
                        <span>Ngôn ngữ: {assistant.transcriberLanguage || '-'}</span>
                        <button className="btn-outline" onClick={() => handleSaveAssistant(assistant)} disabled={isSaving}>
                          Lưu trợ lý
                        </button>
                      </div>
                    </div>
                  ))}
                  {assistants.length === 0 && (
                    <div className="setting-item">
                      <div className="setting-info">
                        <h3>Chưa có trợ lý AI</h3>
                        <p>Hãy tạo trợ lý AI để bắt đầu nhận và xử lý cuộc gọi.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeSection === 'phoneNumbers' && (
              <div className="settings-section">
                <h2>Hotline</h2>
                <p className="settings-section-desc">Gán mỗi số hotline cho trợ lý AI phù hợp để cuộc gọi được xử lý đúng nghiệp vụ.</p>

                <div className="settings-group">
                  {phoneNumbers.map((phoneNumber) => (
                    <div className="setting-item" key={phoneNumber.id}>
                      <div className="setting-info">
                        <h3>{phoneNumber.number || phoneNumber.name}</h3>
                        <p>{phoneNumber.id}</p>
                      </div>
                      <div className="setting-stack">
                        <span>Kênh gọi: {phoneNumber.provider || '-'}</span>
                        <select
                          className="setting-select"
                          value={phoneNumber.assistantId || ''}
                          onChange={(event) => handlePhoneAssistantChange(phoneNumber.id, event.target.value)}
                          disabled={isSaving}
                        >
                          <option value="">Chưa gán trợ lý AI</option>
                          {assistants.map((assistant) => (
                            <option key={assistant.id} value={assistant.id}>{assistant.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                  {phoneNumbers.length === 0 && (
                    <div className="setting-item">
                      <div className="setting-info">
                        <h3>Chưa có hotline</h3>
                        <p>Kết nối hotline để LinhVoice có thể nhận hoặc thực hiện cuộc gọi.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
