import { useRef } from 'react'
import { motion as Motion, useInView } from 'framer-motion'
import GlassCard from '../components/GlassCard'
import { IconChart, IconShield, IconSpark } from '../components/Icons'
import SceneWrapper from '../components/SceneWrapper'
import { fadeUp } from '../data/animations'
import { modelLogos } from '../data/logoAssets'

const strengths = [
  {
    title: 'Bảo mật dữ liệu tuyệt đối',
    text: 'LINH lưu trữ dữ liệu trên các nền tảng bảo mật hàng đầu và kiểm soát quyền truy cập rõ ràng.',
    icon: <IconShield />,
  },
  {
    title: 'Không lưu giữ dữ liệu bên thứ ba',
    text: 'Không cho phép nhà cung cấp AI bên thứ ba lưu trữ dữ liệu hội thoại của bạn.',
    icon: <IconSpark />,
  },
  {
    title: 'Cập nhật các model mới nhất',
    text: 'Liên tục thử nghiệm và lựa chọn model tốt nhất để phục vụ khách hàng.',
    icon: <IconChart />,
  },
]

function ModelNode({ model, index }) {
  return (
    <span className={`model-node model-node-${index}`}>
      <img src={model.logo} alt={model.name} onError={(event) => { event.currentTarget.style.display = 'none' }} />
      <em>{model.name}</em>
    </span>
  )
}

export default function HowItWorksScene() {
  const modelLineupRef = useRef(null)
  const modelLineupInView = useInView(modelLineupRef, { amount: 0.55 })

  return (
    <SceneWrapper>
      <div className="model-scene mx-auto w-full max-w-6xl text-center">
        <Motion.h2 variants={fadeUp} className="cinema-title model-title mx-auto max-w-5xl">
          Bộ não của em được tạo ra từ
          <br />
          <span className="gradient-text">AI Models tân tiến nhất thế giới</span>
        </Motion.h2>

        <Motion.div
          ref={modelLineupRef}
          variants={fadeUp}
          className={`model-orbit model-lineup mt-8${modelLineupInView ? ' is-in-view' : ''}`}
        >
          {modelLogos.map((model, index) => (
            <ModelNode key={model.name} model={model} index={index} />
          ))}
          <div className="model-center">
            <img src="/logos/logo-AI/LINH.png" alt="Linh AI" />
          </div>
        </Motion.div>

        <div className="strength-grid mt-10">
          {strengths.map((item, index) => (
            <GlassCard key={item.title} delay={index * 0.05} className="strength-card">
              <span className="scene-icon">{item.icon}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </SceneWrapper>
  )
}
