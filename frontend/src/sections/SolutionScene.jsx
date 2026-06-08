import { motion as Motion } from 'framer-motion'
import SceneWrapper from '../components/SceneWrapper'
import { fadeUp } from '../data/animations'

const flowSteps = [
  {
    eyebrow: 'Nạp Tri Thức',
    title: 'Bắt đầu cho em ăn kiến thức',
    type: 'knowledge',
    note: 'Vừa đang học...',
    callout: null,
  },
  {
    eyebrow: 'Tự Học Nghiệp vụ',
    title: 'Để em tự học nghiệp vụ',
    type: 'training',
    note: 'Sếp ơi! Em đang tạo các nghiệp vụ và các faqs',
    callout: 'Phân tách kiến thức tạo các kịch bản nghiệp vụ',
  },
  {
    eyebrow: 'Gọi Thử & Cải Tiến',
    title: 'Thử gọi để xem em nói gì',
    type: 'trial',
    note: 'Đề xuất cải tiến phản hồi',
    callout: 'Đang nghe máy',
  },
  {
    eyebrow: 'Báo Cáo & Gợi Ý',
    title: 'Em gửi báo cáo qua Zalo',
    type: 'report',
    note: 'Sau mỗi cuộc gọi, em luôn báo cáo cho sếp các thông tin và tóm tắt cuộc gọi',
    callout: null,
  },
  {
    eyebrow: 'Kết Nối Thực Tế',
    title: 'Gắn em vào số tổng đài của sếp',
    type: 'connect',
    note: 'Sếp có thể chọn số di động hoặc số hotline tổng đài',
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
        <div className="mock-input">website-cua-sep.com</div>
        <div className="mock-tags">
          <i>Nhà xe</i>
          <i>Dịch vụ tư vấn</i>
          <i>Nhà hàng</i>
        </div>
        <div className="mock-loader">{note}</div>
      </div>
    </div>
  )
}

function TrainingMock({ note, callout }) {
  return (
    <div className="use-mock use-mock-training">
      <div className="mock-card">
        <strong>Tiếp nhận đặt xe</strong>
        <p>Nếu khách hàng có nhu cầu đặt chuyến...</p>
        <div>
          <span>Kiến thức 859 từ</span>
          <span>44 FAQs</span>
        </div>
      </div>
      <div className="mock-callout top">{callout}</div>
      <div className="mock-callout bottom">{note}</div>
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
        <p>Bọn nên nói ngay các thông tin cần thiết để đặt bàn như: Bạn muốn đặt bàn cho mấy người và vào khoảng mấy giờ?</p>
      </div>
    </div>
  )
}

function ReportMock({ note }) {
  return (
    <div className="use-mock use-mock-report">
      <div className="mock-message">
        <strong>BOT AI-SUNNY RÔ NHẬN</strong>
        <p>GỌI TỰ ĐỘNG - CUỘC TUẦN</p>
        <p>SĐT khách hàng: 098604...</p>
        <p>Hotline: 99999</p>
      </div>
      <div className="mock-callout report">{note}</div>
    </div>
  )
}

function ConnectMock({ note }) {
  return (
    <div className="use-mock use-mock-connect">
      <div className="mock-form">
        <strong>1 Lựa chọn loại đầu số</strong>
        <label><span /> Số di động</label>
        <label className="muted"><span /> Số SIP Trunk</label>
      </div>
      <div className="mock-callout connect">{note}</div>
    </div>
  )
}

function StepVisual({ step }) {
  if (step.type === 'knowledge') return <KnowledgeMock note={step.note} />
  if (step.type === 'training') return <TrainingMock note={step.note} callout={step.callout} />
  if (step.type === 'trial') return <TrialMock note={step.note} callout={step.callout} />
  if (step.type === 'report') return <ReportMock note={step.note} />
  return <ConnectMock note={step.note} />
}

export default function SolutionScene() {
  return (
    <SceneWrapper className="scene-solution use-flow-scene">
      <div className="use-flow-wrap mx-auto w-full text-center">
        <Motion.h2 variants={fadeUp} className="use-flow-title">
          Làm thế nào để sử dụng em<span className="use-flow-question">?</span>
        </Motion.h2>

        <Motion.div variants={fadeUp} className="use-flow-board">
          <Arrow className="arrow-one" />
          <Arrow className="arrow-two" />
          <Arrow className="arrow-three" />
          <Arrow className="arrow-four" />

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
