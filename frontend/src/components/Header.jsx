export default function Header({ onLoginClick }) {
  return (
    <header className="navbar">
      <div className="brand">
        <div className="brand-mark brand-logo-wrap">
          <img className="brand-logo" src="/linh-logo.png" alt="LINH logo" />
        </div>
        <div>
          <p className="brand-title">LINH AI</p>
          <p className="brand-sub">AI Voice Agent cho doanh nghiệp</p>
        </div>
      </div>

      <nav className="nav-links">
        <a href="#tinh-nang">Tính năng</a>
        <a href="#quy-trinh">Quy trình</a>
        <a href="#nganh-nghe">Ngành nghề</a>
        <a href="#minh-chung">Minh chứng</a>
      </nav>

      <button className="btn btn-primary btn-sm" onClick={onLoginClick}>
        Dùng thử ngay
      </button>
    </header>
  )
}

// PropTypes removed for simplicity
