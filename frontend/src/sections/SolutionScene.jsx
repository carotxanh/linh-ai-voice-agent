import { motion as Motion } from 'framer-motion'
import SceneWrapper from '../components/SceneWrapper'
import { fadeUp } from '../data/animations'

const flowSteps = [
  {
    eyebrow: 'Bước 1',
    title: 'Nạp dữ liệu',
    type: 'knowledge',
    note: 'Đang đọc thông tin...',
    callout: null,
  },
  {
    eyebrow: 'Bước 2',
    title: 'Thử giọng và kịch bản',
    type: 'trial',
    note: 'Chỉnh câu trả lời cho tự nhiên hơn',
    callout: 'Gọi thử',
  },
  {
    eyebrow: 'Bước 3',
    title: 'Kết nối và nhận báo cáo',
    type: 'connect',
    note: 'Có tóm tắt và trạng thái sau mỗi cuộc gọi',
    callout: null,
  },
]

function Arrow({ className }) {
  return (
    <svg className={`use-flow-arrow ${className}`} viewBox="0 0 120 72" aria-hidden="true">
      <path d="M10 38 C42 16 78 20 104 46" />
      <path d="M92 26 L108 49 L80 46" />
    </svg>
  )
}

function KnowledgeMock({ note }) {
  return (
    <div className="use-mock use-mock-knowledge">
      <div className="mock-panel">
        <div className="mock-tabs">
          <span>Website</span>
          <span>Tri thức</span>
        </div>
        <div className="mock-input">linh-ai.vn/kien-thuc</div>
        <div className="mock-tags">
          <i>Sản phẩm</i>
          <i>FAQ</i>
          <i>Quy trình</i>
        </div>
        <div className="mock-loader">{note}</div>
      </div>
    </div>
  )
}

function TrialMock({ note, callout }) {
  return (
    <div className="use-mock use-mock-trial">
      <div className="mock-call-status">{callout}</div>
      <div className="mock-phone">
        <div className="mock-wave">
          {Array.from({ length: 24 }).map((_, index) => (
            <i key={index} style={{ '--bar': `${index % 7}` }} />
          ))}
        </div>
      </div>
      <div className="mock-feedback">
        <strong>{note}</strong>
        <p>Ví dụ: hỏi lại giờ hẹn, xác nhận nhu cầu và dùng câu chào phù hợp với thương hiệu.</p>
      </div>
    </div>
  )
}

function ConnectMock({ note }) {
  return (
    <div className="use-mock use-mock-connect">
      <div className="mock-form">
        <strong>Kết quả cuộc gọi</strong>
        <label><span /> Đã tư vấn xong</label>
        <label className="muted"><span /> Cần người thật gọi lại</label>
      </div>
      <div className="mock-callout connect">{note}</div>
    </div>
  )
}

function StepVisual({ step }) {
  if (step.type === 'knowledge') return <KnowledgeMock note={step.note} />
  if (step.type === 'trial') return <TrialMock note={step.note} callout={step.callout} />
  return <ConnectMock note={step.note} />
}

export default function SolutionScene() {
  return (
    <SceneWrapper className="scene-solution use-flow-scene">
      <div className="use-flow-wrap mx-auto w-full text-center">
        <Motion.h2 variants={fadeUp} className="use-flow-title">
          Luồng hoạt động đơn giản
        </Motion.h2>

        <Motion.div variants={fadeUp} className="use-flow-board simple-flow">
          <Arrow className="arrow-one" />
          <Arrow className="arrow-two" />

          {flowSteps.map((step, index) => (
            <article className={`use-flow-card step-${index + 1}`} key={step.title}>
              <p>{step.eyebrow}</p>
              <h3>{step.title}</h3>
              <StepVisual step={step} />
            </article>
          ))}
        </Motion.div>
      </div>
    </SceneWrapper>
  )
}
