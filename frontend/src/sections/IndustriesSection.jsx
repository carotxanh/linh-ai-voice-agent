import { industriesMatrix } from '../data/constants'
import IndustryIcon from '../components/IndustryIcons'

export default function IndustriesSection() {
  return (
    <section className="section alt-section" id="nganh-nghe">
      <div className="section-heading center">
        <p className="eyebrow">Ứng dụng</p>
        <h2>LINH phục vụ đa dạng ngành nghề</h2>
        <p>
          Với khả năng học hỏi linh hoạt, LINH AI dễ dàng tùy chỉnh để đáp ứng ngôn ngữ và đặc thù riêng
          của mọi lĩnh vực kinh doanh.
        </p>
      </div>

      <div className="industry-matrix">
        <div className="industry-center-card">
          <img className="industry-center-logo" src="/linh-logo.svg" alt="LINH logo" />
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
