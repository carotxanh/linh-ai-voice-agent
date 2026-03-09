import { IconCall, IconEndCall } from './Icons'

export default function VoiceAgent({ 
  conversation, 
  voiceConnecting, 
  onVoiceClick 
}) {
  const getVoiceRingClass = () => {
    if (voiceConnecting) return 'voice-ring connecting'
    if (conversation.status === 'connected') {
      return conversation.isSpeaking ? 'voice-ring connected speaking' : 'voice-ring connected'
    }
    return 'voice-ring'
  }

  const getVoiceStatusText = () => {
    if (voiceConnecting) return 'Đang kết nối...'
    if (conversation.status === 'connected') {
      return conversation.isSpeaking ? 'LINH đang nói...' : 'LINH đang lắng nghe...'
    }
    return 'Nhấn để trò chuyện với LINH'
  }

  return (
    <div className="panel-right">
      <div
        className={getVoiceRingClass()}
        onClick={onVoiceClick}
        role="button"
        tabIndex={0}
        title={conversation.status === 'connected' ? 'Nhấn để kết thúc' : 'Nhấn để trò chuyện'}
      >
        <div className="voice-core">
          {conversation.status === 'connected' ? <IconEndCall /> : <IconCall />}
        </div>
      </div>
      <p className="voice-status">{getVoiceStatusText()}</p>
      <h3>
        {conversation.status === 'connected'
          ? '"Đang trò chuyện với LINH..."'
          : '"Chào LINH, tôi muốn xác nhận đơn hàng và kiểm tra lịch giao."'}
      </h3>
    </div>
  )
}

// PropTypes removed for simplicity
