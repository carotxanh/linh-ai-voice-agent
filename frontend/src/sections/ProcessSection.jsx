import RippleText from '../components/RippleText'
import { steps } from '../data/constants'

const stepIcons = [
  // Icon 1: Upload/Database icon - Nạp dữ liệu
  <svg key="upload" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad-upload" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
        <stop stopColor="#ff6b35" />
        <stop offset="1" stopColor="#f7931e" />
      </linearGradient>
    </defs>
    <rect x="12" y="44" width="56" height="24" rx="6" stroke="url(#grad-upload)" strokeWidth="3" fill="none" />
    <circle cx="24" cy="56" r="3" fill="url(#grad-upload)" />
    <circle cx="34" cy="56" r="3" fill="url(#grad-upload)" />
    <circle cx="44" cy="56" r="3" fill="url(#grad-upload)" />
    <rect x="20" y="18" width="40" height="20" rx="4" stroke="url(#grad-upload)" strokeWidth="2.5" fill="none" opacity="0.5" />
    <path d="M40 10 L40 30" stroke="url(#grad-upload)" strokeWidth="3" strokeLinecap="round" />
    <path d="M32 18 L40 10 L48 18" stroke="url(#grad-upload)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>,

  // Icon 2: Script/Chat flow icon - Thiết lập kịch bản
  <svg key="script" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad-script" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
        <stop stopColor="#ff6b35" />
        <stop offset="1" stopColor="#f7931e" />
      </linearGradient>
    </defs>
    <rect x="8" y="12" width="38" height="28" rx="8" stroke="url(#grad-script)" strokeWidth="3" fill="none" />
    <line x1="16" y1="22" x2="38" y2="22" stroke="url(#grad-script)" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="16" y1="30" x2="32" y2="30" stroke="url(#grad-script)" strokeWidth="2.5" strokeLinecap="round" />
    <rect x="34" y="40" width="38" height="28" rx="8" stroke="url(#grad-script)" strokeWidth="3" fill="none" />
    <line x1="42" y1="50" x2="64" y2="50" stroke="url(#grad-script)" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="42" y1="58" x2="58" y2="58" stroke="url(#grad-script)" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M27 40 L27 46 L34 46" stroke="url(#grad-script)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 3" />
  </svg>,

  // Icon 3: Rocket/Launch icon - Kết nối & Kích hoạt
  <svg key="rocket" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad-rocket" x1="0" y1="80" x2="80" y2="0" gradientUnits="userSpaceOnUse">
        <stop stopColor="#ff6b35" />
        <stop offset="1" stopColor="#f7931e" />
      </linearGradient>
    </defs>
    <path d="M40 10 C40 10 56 18 56 40 C56 62 40 70 40 70 C40 70 24 62 24 40 C24 18 40 10 40 10Z"
      stroke="url(#grad-rocket)" strokeWidth="3" fill="none" />
    <circle cx="40" cy="36" r="6" stroke="url(#grad-rocket)" strokeWidth="2.5" fill="none" />
    <path d="M28 54 L16 62 L22 50" stroke="url(#grad-rocket)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M52 54 L64 62 L58 50" stroke="url(#grad-rocket)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M36 70 L40 78 L44 70" stroke="url(#grad-rocket)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="url(#grad-rocket)" opacity="0.5" />
    <line x1="34" y1="76" x2="34" y2="72" stroke="url(#grad-rocket)" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
    <line x1="46" y1="76" x2="46" y2="72" stroke="url(#grad-rocket)" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
  </svg>,
]

export default function ProcessSection() {
  return (
    <section className="section" id="quy-trinh">
      <div className="section-heading center">
        <p className="eyebrow">Triển khai</p>
        <RippleText>
          <h2>3 bước đơn giản để đưa LINH vào vận hành</h2>
        </RippleText>
      </div>

      <div className="steps-grid">
        {steps.map((item, index) => (
          <article className="step-card glass-card" key={item.title}>
            <span className="step-index">0{index + 1}</span>
            <div className="step-icon-large">
              {stepIcons[index]}
            </div>
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
