import { motion as Motion } from 'framer-motion'
import {
  IconBank,
  IconBuilding,
  IconCall,
  IconCar,
  IconCart,
  IconChart,
  IconChemical,
  IconCloud,
  IconConsult,
  IconEducation,
  IconEmotion,
  IconEnergy,
  IconFactory,
  IconFashion,
  IconFood,
  IconHeadset,
  IconHome,
  IconHospital,
  IconLaw,
  IconLock,
  IconMoney,
  IconPill,
  IconScript,
  IconService,
  IconShield,
  IconShop,
  IconSignal,
  IconSpark,
  IconSport,
  IconTicket,
  IconTruck,
  IconWarehouse,
} from '../components/Icons'
import SceneWrapper from '../components/SceneWrapper'
import { fadeUp } from '../data/animations'

const industries = [
  { name: 'Bán lẻ', icon: IconShop },
  { name: 'Ngân hàng', icon: IconBank },
  { name: 'Sản xuất', icon: IconFactory },
  { name: 'Xây dựng', icon: IconBuilding },
  { name: 'Logistics', icon: IconTruck },
  { name: 'Dệt may', icon: IconFashion },
  { name: 'Thực phẩm', icon: IconFood },
  { name: 'Bất động sản', icon: IconHome },
  { name: 'Viễn thông', icon: IconSignal },
  { name: 'Năng lượng', icon: IconEnergy },
  { name: 'Ô tô', icon: IconCar },
  { name: 'Hóa chất', icon: IconChemical },
  { name: 'Tư vấn', icon: IconConsult },
  { name: 'Thể thao', icon: IconSport },
  { name: 'Tài chính', icon: IconMoney },
  { name: 'Dược phẩm', icon: IconPill },
  { name: 'Dịch vụ', icon: IconService },
  { name: 'Luật pháp', icon: IconLaw },
  { name: 'Đào tạo', icon: IconEducation },
  { name: 'Y tế', icon: IconHospital },
  { name: 'Bảo trì', icon: IconService },
  { name: 'Nhà hàng', icon: IconFood },
  { name: 'Phòng khám', icon: IconHospital },
  { name: 'Spa', icon: IconEmotion },
  { name: 'Nha khoa', icon: IconHospital },
  { name: 'TMĐT', icon: IconCart },
  { name: 'SaaS', icon: IconCloud },
  { name: 'Kho bãi', icon: IconWarehouse },
  { name: 'Bảo hành', icon: IconShield },
  { name: 'Điện máy', icon: IconShop },
  { name: 'Nông nghiệp', icon: IconFactory },
  { name: 'Thương mại', icon: IconChart },
  { name: 'Bệnh viện', icon: IconHospital },
  { name: 'Nhà thuốc', icon: IconPill },
  { name: 'Vé xe', icon: IconTicket },
  { name: 'Hàng không', icon: IconTicket },
  { name: 'Telesales', icon: IconCall },
  { name: 'Tổng đài', icon: IconHeadset },
  { name: 'Bảo mật', icon: IconLock },
  { name: 'Chăm sóc KH', icon: IconEmotion },
  { name: 'Đặt lịch', icon: IconScript },
  { name: 'Bán hàng', icon: IconCart },
  { name: 'Hậu mãi', icon: IconService },
  { name: 'Tuyển sinh', icon: IconEducation },
  { name: 'Báo cáo', icon: IconChart },
  { name: 'Xác nhận đơn', icon: IconShield },
  { name: 'Nhắc lịch', icon: IconScript },
  { name: 'Theo dõi lead', icon: IconChart },
  { name: 'Khiếu nại', icon: IconHeadset },
  { name: 'Gia hạn DV', icon: IconService },
  { name: 'Chốt lịch hẹn', icon: IconScript },
  { name: 'Tư vấn SP', icon: IconConsult },
  { name: 'Thu phản hồi', icon: IconEmotion },
  { name: 'Đối soát', icon: IconMoney },
  { name: 'Quản lý BT', icon: IconService },
  { name: 'Tái kích hoạt', icon: IconSpark },
  { name: 'Khảo sát', icon: IconChart },
  { name: 'Đặt bàn', icon: IconFood },
  { name: 'Giao hàng', icon: IconTruck },
  { name: 'Thanh toán', icon: IconMoney },
  { name: 'Đăng ký DV', icon: IconScript },
  { name: 'Hỗ trợ KT', icon: IconService },
  { name: 'Upsell', icon: IconSpark },
  { name: 'Cross-sell', icon: IconCart },
  { name: 'Nhắc nợ', icon: IconMoney },
  { name: 'Xác thực OTP', icon: IconLock },
  { name: 'Đặt khám', icon: IconHospital },
  { name: 'Tra cứu', icon: IconChart },
  { name: 'Hotline 24/7', icon: IconHeadset },
  { name: 'Du lịch', icon: IconTicket },
  { name: 'Khách sạn', icon: IconHome },
  { name: 'Bảo hiểm', icon: IconShield },
]

export default function UseCasesScene() {
  return (
    <SceneWrapper className="items-center industry-fullbleed">
      <div className="industry-scene mx-auto w-full max-w-none text-center">
        <Motion.h2 variants={fadeUp} className="industry-headline mx-auto">
          LINH tự hào phục vụ
          <br />
          tất cả các ngành nghề
        </Motion.h2>

        <Motion.div variants={fadeUp} className="industry-universe industry-mosaic mt-10">
          <div className="industry-core">
            <img src="/linh-logo.svg" alt="Linh AI" />
          </div>
          {industries.map((industry, index) => {
            const IndustryIcon = industry.icon
            return (
              <span key={`${industry.name}-${index}`} className={`industry-tile ${index % 9 === 0 ? 'highlight' : ''}`}>
                <IndustryIcon />
                {industry.name}
              </span>
            )
          })}
        </Motion.div>
      </div>
    </SceneWrapper>
  )
}
