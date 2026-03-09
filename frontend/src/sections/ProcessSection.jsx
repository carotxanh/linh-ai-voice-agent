import { steps } from '../data/constants'

export default function ProcessSection() {
  return (
    <section className="section" id="quy-trinh">
      <div className="section-heading center">
        <p className="eyebrow">Triển khai</p>
        <h2>3 bước để đưa LINH vào vận hành</h2>
      </div>

      <div className="steps-grid">
        {steps.map((item, index) => (
          <article className="step-card glass-card" key={item.title}>
            <span className="step-index">0{index + 1}</span>
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
