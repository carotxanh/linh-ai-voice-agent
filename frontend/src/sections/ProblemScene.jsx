import { motion as Motion } from 'framer-motion'
import SceneWrapper from '../components/SceneWrapper'
import { fadeUp } from '../data/animations'
import { clientLogos } from '../data/logoAssets'

const testimonials = [
  {
    name: 'LINH - Anh Hưng nhà xe',
    time: '17:27',
    members: '17 thành viên',
    summary: ['Khách đặt xe Hà Tĩnh -> Thái Bình', 'Ngày giờ đặt: 18h00 28/7/2025', 'Số lượng khách: 2 người', 'Tên khách hàng: Duy'],
    messages: [
      ['left', 'Anh cần đặt xe đi Thái Bình tối nay, 2 người nhé.'],
      ['right', 'Dạ em đã ghi nhận lịch và gửi nhắc hẹn cho mình ạ.'],
      ['left', 'Kaka dạ em cảm ơn'],
    ],
    quote: 'So với ngày đầu thì chất lượng bot giờ ổn hơn nhiều rồi em. Đúng là càng xài, càng ngon. Giờ lượng khách bên anh cũng tăng đều + mấy bạn nhân sự cũng có thời gian tập trung hậu kỳ hơn',
    offset: 'high',
  },
  {
    name: 'LINH - Cơ khí 247',
    time: '17:44',
    members: '24 thành viên',
    summary: ['BOT AI LINH', 'SĐT khách hàng: 09xxxx', 'Mã cuộc gọi: 202507...', 'Mua sản phẩm 300 bao tải cũ'],
    messages: [
      ['right', 'Hơn 5 tháng vừa rồi sử dụng, anh Quang có feedback gì về chất lượng AI bên em không ạ.'],
      ['left', 'Từ lúc có AI hỗ trợ thì anh với mấy bạn CSKH nhẹ đầu hẳn, giờ có thời gian đi làm việc khác chứ không ngồi trực điện thoại cả ngày'],
      ['right', 'Dạ giúp được công ty anh như vậy cũng là thành công bên em rồi ạ'],
      ['left', 'Nhưng sắp tới bổ sung thêm giọng Gia Lai cho anh nhé ^^'],
    ],
    quote: 'Từ lúc có AI hỗ trợ thì anh với mấy bạn CSKH nhẹ đầu hẳn, giờ có thời gian đi làm việc khác chứ không ngồi trực điện thoại cả ngày',
    offset: 'low',
  },
  {
    name: 'LINH - Điện máy Toàn Phát',
    time: '17:49',
    members: '6 thành viên',
    summary: ['Khách yêu cầu bảo hành máy lọc nước', 'Tính năng nước nóng không hoạt động', 'Audio: Link'],
    messages: [
      ['left', 'Máy lọc nhà anh bị lỗi nước nóng, bên em xem giúp anh với.'],
      ['right', 'Dạ em đã ghi nhận và chuyển lịch bảo hành cho kỹ thuật phụ trách.'],
      ['left', 'Còn về dịch vụ thì anh hài lòng, có vấn đề gì mấy bạn xử lý chứ không cần đợi anh nhắc'],
      ['right', 'Em cảm ơn feedback của anh ạ'],
    ],
    quote: 'Nhờ bên em xử lý khiếu nại giùm nên giờ anh không gặp tình trạng khách điện lên chửi chẳng choẹ vì không ai bắt máy',
    offset: 'high',
  },
  {
    name: 'LINH - Toyota Vĩnh Phúc',
    time: '17:55',
    members: '30 thành viên',
    summary: ['Khách tìm hiểu Land Cruiser', 'Đặt lịch: 2h00 chiều tới Showroom xem xe', 'Mã cuộc gọi: 486...'],
    messages: [
      ['left', 'Chị cần tư vấn Land Cruiser và đặt lịch xem xe chiều nay.'],
      ['right', 'Dạ em đã đặt lịch 2h00 chiều tại showroom và gửi thông tin cho đội sales ạ.'],
      ['left', 'Nhớ chia hoa hồng cho chị nhaaa'],
      ['right', 'Em cảm ơn feedback của chị ạ'],
    ],
    quote: 'Đáng đồng tiền bát gạo em ạ. Giờ bọn chị có nhiều cơ hội để chốt sales hơn tại trước khách tiềm năng liên hệ mà ko ai bắt máy hết',
    offset: 'low',
  },
]

function LogoTile({ logo }) {
  return (
    <span className={`logo-tile logo-${logo.key ?? logo.name.toLowerCase()}`}>
      <img src={logo.logo} alt={logo.name} onError={(event) => { event.currentTarget.style.display = 'none' }} />
      <strong aria-hidden="true">{logo.name}</strong>
    </span>
  )
}

function TestimonialPhone({ item, index }) {
  return (
    <article className={`testimonial-phone ${item.offset}`} tabIndex={0}>
      <div className="testimonial-phone-bar">
        <span>{item.time}</span>
        <strong>{item.name}</strong>
        <i>{item.members}</i>
      </div>

      <div className="testimonial-chat">
        <div className="testimonial-summary">
          <strong>📌 Tóm tắt cuộc gọi:</strong>
          {item.summary.map((line) => (
            <span key={line}>- {line}</span>
          ))}
        </div>
        <button type="button">Đặt nhắc hẹn</button>
        {item.messages.map(([side, text], messageIndex) => (
          <p className={`testimonial-message ${side}`} key={`${index}-${messageIndex}`}>
            {text}
          </p>
        ))}
        <div className="testimonial-input">Tin nhắn</div>
      </div>

      <blockquote>"{item.quote}"</blockquote>
    </article>
  )
}

export default function ProblemScene() {
  return (
    <SceneWrapper className="items-center">
      <div className="proof-scene mx-auto w-full max-w-7xl text-center">
        <Motion.p variants={fadeUp} className="scene-label">
          Kết quả vận hành
        </Motion.p>
        <Motion.h2 variants={fadeUp} className="cinema-title proof-title mx-auto">
          Em tự hào xử lý <span className="gradient-text warning">1.000.000 cuộc gọi</span>
          <br />
          đến của hơn <span className="gradient-text">100+ doanh nghiệp</span> Việt Nam
        </Motion.h2>

        <Motion.div variants={fadeUp} className="logo-cloud mt-7">
          {clientLogos.map((logo) => (
            <LogoTile key={logo.name} logo={logo} />
          ))}
        </Motion.div>

        <Motion.h3 variants={fadeUp} className="testimonial-headline">
          Đừng tin em nói, hãy nghe khách hàng em nói
        </Motion.h3>

        <Motion.div variants={fadeUp} className="testimonial-phones">
          {testimonials.map((item, index) => (
            <TestimonialPhone key={item.name} item={item} index={index} />
          ))}
        </Motion.div>
      </div>
    </SceneWrapper>
  )
}
