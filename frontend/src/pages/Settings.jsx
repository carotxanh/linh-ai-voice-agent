import { useEffect, useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import {
  getAccountIntegration,
  getVoiceAssistants,
  getVoicePhoneNumbers,
  updateAccountIntegration,
  updateVoiceAssistant,
  updateVoicePhoneNumber,
} from '../services/voice'
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
  const [activeSection, setActiveSection] = useState('connection')
  const [connection, setConnection] = useState({ hasApiKey: false, apiBaseUrl: '' })
  const [connectionKey, setConnectionKey] = useState('')
  const [assistants, setAssistants] = useState([])
  const [phoneNumbers, setPhoneNumbers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [saveMessage, setSaveMessage] = useState('')

  const sections = [
    { id: 'connection', icon: 'vpn_key', label: 'Kết nối' },
    { id: 'assistants', icon: 'smart_toy', label: 'Trợ lý AI' },
    { id: 'phoneNumbers', icon: 'settings_phone', label: 'Hotline' },
  ]

  const loadSettingsData = async () => {
    setIsLoading(true)
    setLoadError('')

    try {
      const integration = await getAccountIntegration()
      const nextConnection = {
        hasApiKey: Boolean(integration.has_api_key),
        apiBaseUrl: integration.api_base_url || '',
      }
      setConnection(nextConnection)

      if (!nextConnection.hasApiKey) {
        setAssistants([])
        setPhoneNumbers([])
        return
      }

      const [loadedAssistants, loadedPhoneNumbers] = await Promise.all([
        getVoiceAssistants(100),
        getVoicePhoneNumbers(100),
      ])
      setAssistants(Array.isArray(loadedAssistants) ? loadedAssistants : [])
      setPhoneNumbers(Array.isArray(loadedPhoneNumbers) ? loadedPhoneNumbers : [])
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

  const handleSaveConnection = async () => {
    setIsSaving(true)
    setSaveMessage('')

    try {
      const updatedConnection = await updateAccountIntegration({
        api_key: connectionKey,
      })
      setConnection({
        hasApiKey: Boolean(updatedConnection.has_api_key),
        apiBaseUrl: updatedConnection.api_base_url || '',
      })
      setConnectionKey('')
      setSaveMessage('Đã lưu kết nối cho tài khoản này.')
      await loadSettingsData()
    } catch (error) {
      setSaveMessage(`Không thể lưu kết nối: ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleAssistantFieldChange = (assistantId, field, value) => {
    setAssistants((currentAssistants) => currentAssistants.map((assistant) => (
      assistant.id === assistantId ? { ...assistant, [field]: value } : assistant
    )))
  }

  const handleSaveAssistant = async (assistant) => {
    setIsSaving(true)
    setSaveMessage('')

    try {
      const updatedAssistant = await updateVoiceAssistant(assistant.id, {
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
      const updatedPhoneNumber = await updateVoicePhoneNumber(phoneNumberId, {
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

  const isDisconnected = !connection.hasApiKey

  return (
    <DashboardLayout>
      <div className="settings-page">
        <div className="settings-header">
          <h1>Thiết lập LinhVoice</h1>
          <p className="settings-subtitle">Cấu hình kết nối, trợ lý AI, hotline và cách tổ chức dữ liệu cho doanh nghiệp.</p>
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
            {activeSection === 'connection' && (
              <div className="settings-section">
                <h2>Kết nối dữ liệu thoại</h2>
                <p className="settings-section-desc">Mỗi tài khoản doanh nghiệp có một khóa kết nối riêng để LinhVoice tải cuộc gọi, trợ lý AI, hotline và kho dữ liệu đúng phạm vi.</p>

                <div className="settings-group">
                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>Trạng thái kết nối</h3>
                      <p>{connection.hasApiKey ? 'Tài khoản này đã có khóa kết nối.' : 'Tài khoản này chưa có khóa kết nối.'}</p>
                    </div>
                    <span className={`data-source-badge ${connection.hasApiKey ? 'connected' : ''}`}>
                      {connection.hasApiKey ? 'Đã kết nối' : 'Chưa kết nối'}
                    </span>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>Khóa kết nối</h3>
                      <p>Nhập khóa được cấp cho doanh nghiệp. LinhVoice sẽ mã hóa khóa này trước khi lưu.</p>
                    </div>
                    <div className="setting-stack">
                      <input
                        type="password"
                        className="setting-input"
                        value={connectionKey}
                        onChange={(event) => setConnectionKey(event.target.value)}
                        placeholder={connection.hasApiKey ? 'Nhập khóa mới để thay thế' : 'Nhập khóa kết nối'}
                      />
                      <button
                        className="btn-save"
                        onClick={handleSaveConnection}
                        disabled={isSaving || connectionKey.trim().length < 12}
                      >
                        <MIcon name="save" size={18} />
                        {isSaving ? 'Đang lưu' : 'Lưu kết nối'}
                      </button>
                    </div>
                  </div>
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
                        <h3>{isDisconnected ? 'Chưa kết nối dữ liệu thoại' : 'Chưa có trợ lý AI'}</h3>
                        <p>{isDisconnected ? 'Hãy lưu khóa kết nối trước để tải danh sách trợ lý AI.' : 'Hãy tạo trợ lý AI để bắt đầu nhận và xử lý cuộc gọi.'}</p>
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
                        <h3>{isDisconnected ? 'Chưa kết nối dữ liệu thoại' : 'Chưa có hotline'}</h3>
                        <p>{isDisconnected ? 'Hãy lưu khóa kết nối trước để tải danh sách hotline.' : 'Kết nối hotline để LinhVoice có thể nhận hoặc thực hiện cuộc gọi.'}</p>
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
