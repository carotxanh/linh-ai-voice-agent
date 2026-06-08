import { motion as Motion } from 'framer-motion'

export default function Navbar({ activeScene = 0, onNavigate, onCta }) {
  const links = [
    ['Đánh giá', 1],
    ['Hoạt động', 2],
    ['Ngành nghề', 3],
    ['Bảng giá', 5],
  ]

  return (
    <Motion.header
      className="topbar-shell"
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <nav className="topbar-nav-card" aria-label="Điều hướng chính">
        <button className="topbar-logo-card" onClick={() => onNavigate(0)} type="button" aria-label="Về đầu trang">
          <img src="/logos/logo-AI/LINH.png" alt="Linh AI" />
        </button>

        {links.map(([label, index]) => (
          <button
            key={label}
            type="button"
            className={activeScene === index ? 'active' : ''}
            onClick={() => onNavigate(index)}
          >
            {label}
          </button>
        ))}
      </nav>

      <Motion.button
        type="button"
        className="topbar-cta-card"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.98 }}
        onClick={onCta}
      >
        Trải Nghiệm Ngay
      </Motion.button>
    </Motion.header>
  )
}
