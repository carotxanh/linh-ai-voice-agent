import RippleText from '../components/RippleText'

export default function ProofSection() {
  return (
    <section className="section" id="minh-chung">
      <div className="proof-card glass-card">
        <div className="proof-copy">
          <p className="eyebrow">Giải thưởng & Ghi nhận</p>
          <RippleText>
            <h2>Giải nhì VNPT AI Hackathon 2025 - AI Voice Agent</h2>
          </RippleText>

          <p className="proof-description">
            Tự hào đạt Giải nhì VNPT AI Hackathon 2025 với đề tài AI Voice Agent. Đây là minh chứng rõ nét cho năng lực công nghệ lõi và tính ứng dụng thực tiễn cao của LINH AI trong việc giải quyết bài toán vận hành của doanh nghiệp.
          </p>
        </div>

        <div className="proof-visual">
          <div className="award-badge">TOP 2</div>
          <img
            src="/hackathon.png"
            alt="VNPT AI Hackathon - Giải nhì"
            className="proof-image"
          />
        </div>
      </div>
    </section>
  )
}
