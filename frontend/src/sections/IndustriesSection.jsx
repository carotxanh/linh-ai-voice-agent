import { industriesMatrix } from '../data/constants'
import IndustryIcon from '../components/IndustryIcons'

export default function IndustriesSection() {
  return (
    <section className="section alt-section" id="nganh-nghe">
      <div className="section-heading center">
        <p className="eyebrow">Ứng dụng</p>
        <h2>LINH phục vụ đa ngành nghề</h2>
        <p>
          LINH có thể triển khai cho nhiều mô hình doanh nghiệp với luồng tư vấn,
          chăm sóc khách hàng, xác nhận đơn, đặt lịch và sàng lọc nhu cầu tự động.
        </p>
      </div>

      <div className="industry-matrix">
        <div className="industry-center-card">
          <img className="industry-center-logo" src="/linh-logo.png" alt="LINH logo" />
        </div>

        {industriesMatrix.map((item, index) => (
          <button
            key={`${item.name}-${index}`}
            type="button"
            className="industry-tile"
          >
            <IndustryIcon name={item.icon} />
            <span className="industry-name">{item.name}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
