import RippleText from '../components/RippleText'
import { IconCall, IconChart, IconSpark, IconShield } from '../components/Icons'
import { features } from '../data/constants'

const featureIcons = [IconCall, IconChart, IconSpark, IconShield]

export default function FeaturesSection() {
  return (
    <section className="section" id="tinh-nang">
      <div className="section-heading center">
        <p className="eyebrow">Lợi ích cốt lõi</p>
        <RippleText>
          <h2>Giải quyết triệt để bài toán vận hành tổng đài của bạn</h2>
        </RippleText>
        <p>
          Lợi thế vượt trội khi ứng dụng LINH AI vào hệ thống chăm sóc khách hàng và vận hành tổng đài
          doanh nghiệp.
        </p>
      </div>

      <div className="feature-grid">
        {features.map((feature, index) => {
          const Icon = featureIcons[index]
          return (
            <article className="feature-card glass-card" key={feature.title}>
              <div className="icon-wrap"><Icon /></div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </article>
          )
        })}
      </div>
    </section>
  )
}
