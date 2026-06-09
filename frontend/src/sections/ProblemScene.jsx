import { useEffect, useState } from 'react'
import { motion as Motion } from 'framer-motion'
import SceneWrapper from '../components/SceneWrapper'
import { fadeUp } from '../data/animations'

const practicalPoints = [
  {
    title: 'Hiểu đúng nhu cầu',
    text: 'LINH hỏi lại khi thiếu thông tin, ghi nhận ý chính và giữ cuộc gọi đi đúng mục tiêu.',
  },
  {
    title: 'Nói tự nhiên hơn',
    text: 'Câu trả lời được viết theo ngữ cảnh, hạn chế cảm giác đọc kịch bản máy móc.',
  },
  {
    title: 'Bàn giao rõ ràng',
    text: 'Sau cuộc gọi có tóm tắt, thông tin cần xử lý và trạng thái để đội ngũ tiếp tục nhanh.',
  },
]

const voiceConversations = [
  {
    customer: 'Bên mình còn nhận đặt lịch chiều nay không?',
    linh: 'Dạ còn ạ. Mình muốn đặt khoảng mấy giờ để em kiểm tra lịch trống giúp mình?',
    summary: 'Khách muốn đặt lịch chiều nay, cần kiểm tra khung giờ còn trống.',
  },
  {
    customer: 'Đơn của chị giao tới đâu rồi em?',
    linh: 'Dạ em kiểm tra theo số điện thoại này nhé. Đơn đang trên đường giao và dự kiến tới trước 5 giờ chiều nay.',
    summary: 'Khách hỏi trạng thái đơn hàng, cần cập nhật thời gian giao dự kiến.',
  },
  {
    customer: 'Anh muốn hỏi gói dịch vụ cho cửa hàng nhỏ.',
    linh: 'Dạ mình đang cần tự động nghe máy, xác nhận đơn hay chăm sóc khách cũ nhiều hơn ạ?',
    summary: 'Khách quan tâm gói dịch vụ, cần tư vấn theo nhu cầu vận hành cửa hàng.',
  },
  {
    customer: 'Máy bên anh báo lỗi, bên em có hỗ trợ bảo hành không?',
    linh: 'Dạ có ạ. Anh cho em xin mã sản phẩm và tình trạng lỗi hiện tại để em chuyển kỹ thuật kiểm tra.',
    summary: 'Khách cần bảo hành, đã ghi nhận lỗi và thông tin cần chuyển kỹ thuật.',
  },
]

function VoiceConversation({ item }) {
  return (
    <article className="voice-exchange">
      <div className="voice-lines">
        <p>
          <strong>Khách:</strong> {item.customer}
        </p>
        <p>
          <strong>LINH:</strong> {item.linh}
        </p>
      </div>
      <div className="voice-summary">
        <span>Tóm tắt sau cuộc gọi</span>
        <strong>{item.summary}</strong>
      </div>
    </article>
  )
}

export default function ProblemScene() {
  const [conversationIndex, setConversationIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setConversationIndex((current) => (current + 1) % voiceConversations.length)
    }, 1800)

    return () => clearInterval(interval)
  }, [])

  const activeConversation = voiceConversations[conversationIndex]

  return (
    <SceneWrapper className="items-center">
      <div className="proof-scene proof-scene-simple mx-auto w-full max-w-6xl text-center">
        <Motion.p variants={fadeUp} className="scene-label">
          Vận hành thực tế
        </Motion.p>
        <Motion.h2 variants={fadeUp} className="cinema-title proof-title mx-auto">
          Tập trung vào <span className="gradient-text warning">cuộc gọi thật</span>
          <br />
          và cách khách hàng muốn được nghe
        </Motion.h2>

        <Motion.div variants={fadeUp} className="practical-grid">
          {practicalPoints.map((item, index) => (
            <article className="practical-card" key={item.title}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </Motion.div>

        <Motion.div variants={fadeUp} className="natural-voice-panel" aria-label="Các ví dụ hội thoại">
          <VoiceConversation key={activeConversation.customer} item={activeConversation} />
        </Motion.div>
      </div>
    </SceneWrapper>
  )
}
