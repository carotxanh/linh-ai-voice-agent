import RippleText from '../components/RippleText'
import { testimonials } from '../data/constants'

export default function TestimonialsSection() {
  return (
    <section className="section alt-section">
      <div className="section-heading center">
        <p className="eyebrow">Khách hàng nói gì</p>
        <RippleText>
          <h2>Hàng trăm doanh nghiệp đã tối ưu vận hành cùng LINH AI</h2>
        </RippleText>
      </div>

      <div className="testimonial-grid">
        {testimonials.map((item) => (
          <article className="testimonial-card glass-card" key={item.name}>
            <div className="testimonial-head">
              <div className="avatar">{item.name.charAt(0)}</div>
              <div>
                <h3>{item.name}</h3>
                <p>{item.role}</p>
              </div>
            </div>
            <blockquote>"{item.quote}"</blockquote>
            <div className="reply-bubble">{item.reply}</div>
          </article>
        ))}
      </div>
    </section>
  )
}
