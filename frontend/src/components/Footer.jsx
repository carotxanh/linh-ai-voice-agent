export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer" id="footer">
      {/* CTA Section */}
      <div className="footer-cta">
        <h3>Sẵn sàng nâng cấp trải nghiệm khách hàng?</h3>
        <p>
          Hãy để LINH AI giúp doanh nghiệp bạn tự động hóa tổng đài, tiết kiệm chi phí
          và phục vụ khách hàng 24/7.
        </p>
        <div className="footer-cta-actions">
          <a href="#" className="btn btn-primary">Dùng thử miễn phí</a>
          <a href="mailto:contact@linhai.vn" className="btn btn-secondary">Liên hệ tư vấn</a>
        </div>
      </div>

      <div className="footer-main">
        {/* Brand Column */}
        <div className="footer-brand">
          <div className="footer-logo-wrap">
            <img className="footer-logo" src="/linh-logo.png" alt="LINH AI logo" />
            <div>
              <p className="brand-title">LINH AI</p>
              <p className="footer-tagline">AI Voice Agent cho doanh nghiệp</p>
            </div>
          </div>
          <p className="footer-desc">
            Giải pháp trợ lý thoại AI thông minh, giúp doanh nghiệp tự động hóa tổng đài chăm sóc khách hàng,
            tư vấn và xử lý đơn hàng 24/7.
          </p>
        </div>

        {/* Quick Links */}
        <div className="footer-col">
          <h4 className="footer-col-title">Sản phẩm</h4>
          <nav className="footer-nav">
            <a href="#tinh-nang">Tính năng</a>
            <a href="#quy-trinh">Quy trình triển khai</a>
            <a href="#nganh-nghe">Ngành nghề</a>
            <a href="#minh-chung">Giải thưởng</a>
          </nav>
        </div>

        {/* Contact Info */}
        <div className="footer-col">
          <h4 className="footer-col-title">Liên hệ</h4>
          <nav className="footer-nav">
            <a href="mailto:contact@linhai.vn">contact@linhai.vn</a>
            <a href="tel:+84123456789">+84 123 456 789</a>
            <span className="footer-address">TP. Hồ Chí Minh, Việt Nam</span>
          </nav>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <p className="footer-copyright">
          © {currentYear} LINH AI. All rights reserved.
        </p>
        <div className="footer-social">
          <a href="#" aria-label="Facebook" className="footer-social-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </a>
          <a href="#" aria-label="LinkedIn" className="footer-social-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </a>
          <a href="#" aria-label="YouTube" className="footer-social-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  )
}
