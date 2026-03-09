import { useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import './Settings.css'

function MIcon({ name, className = '', filled = false, size = 24 }) {
    return (
        <span
            className={`material-symbols-rounded ${className}`}
            style={{
                fontSize: size,
                fontVariationSettings: filled ? "'FILL' 1" : "'FILL' 0",
            }}
        >
            {name}
        </span>
    )
}

export default function Settings() {
    const [activeSection, setActiveSection] = useState('general')

    const sections = [
        { id: 'general', icon: 'settings', label: 'Tổng quát' },
        { id: 'voice', icon: 'mic', label: 'Giọng nói AI' },
        { id: 'notifications', icon: 'notifications', label: 'Thông báo' },
        { id: 'security', icon: 'shield', label: 'Bảo mật' },
        { id: 'language', icon: 'language', label: 'Ngôn ngữ' },
    ]

    return (
        <DashboardLayout>
            <div className="settings-page">
                <div className="settings-header">
                    <h1>Cài đặt</h1>
                    <p className="settings-subtitle">Tùy chỉnh hệ thống theo nhu cầu của bạn</p>
                </div>

                <div className="settings-layout">
                    {/* Settings Navigation */}
                    <nav className="settings-nav">
                        {sections.map(section => (
                            <button
                                key={section.id}
                                className={`settings-nav-item ${activeSection === section.id ? 'active' : ''}`}
                                onClick={() => setActiveSection(section.id)}
                            >
                                <MIcon
                                    name={section.icon}
                                    size={22}
                                    filled={activeSection === section.id}
                                    className="settings-nav-icon"
                                />
                                <span>{section.label}</span>
                            </button>
                        ))}
                    </nav>

                    {/* Settings Content */}
                    <div className="settings-content">
                        {activeSection === 'general' && (
                            <div className="settings-section">
                                <h2>Tổng quát</h2>
                                <p className="settings-section-desc">Cấu hình chung cho hệ thống</p>

                                <div className="settings-group">
                                    <div className="setting-item">
                                        <div className="setting-info">
                                            <h3>Tên doanh nghiệp</h3>
                                            <p>Tên hiển thị trong cuộc gọi và báo cáo</p>
                                        </div>
                                        <input type="text" className="setting-input" defaultValue="Nhà Xe Vạn Minh" />
                                    </div>
                                    <div className="setting-item">
                                        <div className="setting-info">
                                            <h3>Email liên hệ</h3>
                                            <p>Email nhận thông báo hệ thống</p>
                                        </div>
                                        <input type="email" className="setting-input" defaultValue="nhaxevanminh@gmail.com" />
                                    </div>
                                    <div className="setting-item">
                                        <div className="setting-info">
                                            <h3>Số điện thoại</h3>
                                            <p>Số điện thoại chính đăng ký</p>
                                        </div>
                                        <input type="tel" className="setting-input" defaultValue="1900 6767" />
                                    </div>
                                    <div className="setting-item">
                                        <div className="setting-info">
                                            <h3>Múi giờ</h3>
                                            <p>Múi giờ sử dụng cho lịch trình và báo cáo</p>
                                        </div>
                                        <select className="setting-select">
                                            <option value="Asia/Ho_Chi_Minh">UTC+7 (Ho Chi Minh)</option>
                                            <option value="Asia/Bangkok">UTC+7 (Bangkok)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="settings-actions">
                                    <button className="btn-save">
                                        <MIcon name="save" size={18} /> Lưu thay đổi
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeSection === 'voice' && (
                            <div className="settings-section">
                                <h2>Giọng nói AI</h2>
                                <p className="settings-section-desc">Tùy chỉnh giọng nói và hành vi của AI Agent</p>

                                <div className="settings-group">
                                    <div className="setting-item">
                                        <div className="setting-info">
                                            <h3>Tên Agent</h3>
                                            <p>Tên mà AI sẽ tự giới thiệu</p>
                                        </div>
                                        <input type="text" className="setting-input" defaultValue="LINH" />
                                    </div>
                                    <div className="setting-item">
                                        <div className="setting-info">
                                            <h3>Giọng nói</h3>
                                            <p>Chọn giọng nói cho AI Agent</p>
                                        </div>
                                        <select className="setting-select">
                                            <option>Nữ - Miền Bắc</option>
                                            <option>Nữ - Miền Nam</option>
                                            <option>Nam - Miền Bắc</option>
                                            <option>Nam - Miền Nam</option>
                                        </select>
                                    </div>
                                    <div className="setting-item">
                                        <div className="setting-info">
                                            <h3>Tốc độ nói</h3>
                                            <p>Điều chỉnh tốc độ nói của AI</p>
                                        </div>
                                        <div className="setting-slider-container">
                                            <input type="range" className="setting-slider" min="0.5" max="2" step="0.1" defaultValue="1" />
                                            <span className="slider-value">1.0x</span>
                                        </div>
                                    </div>
                                    <div className="setting-item">
                                        <div className="setting-info">
                                            <h3>Tự động chuyển tiếp</h3>
                                            <p>Tự động chuyển tiếp cho nhân viên khi AI không xử lý được</p>
                                        </div>
                                        <label className="setting-toggle">
                                            <input type="checkbox" defaultChecked />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </div>
                                </div>

                                <div className="settings-actions">
                                    <button className="btn-save">
                                        <MIcon name="save" size={18} /> Lưu thay đổi
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeSection === 'notifications' && (
                            <div className="settings-section">
                                <h2>Thông báo</h2>
                                <p className="settings-section-desc">Quản lý cách bạn nhận thông báo</p>

                                <div className="settings-group">
                                    <div className="setting-item">
                                        <div className="setting-info">
                                            <h3>Thông báo qua email</h3>
                                            <p>Nhận báo cáo và thông báo qua email</p>
                                        </div>
                                        <label className="setting-toggle">
                                            <input type="checkbox" defaultChecked />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </div>
                                    <div className="setting-item">
                                        <div className="setting-info">
                                            <h3>Cuộc gọi nhỡ</h3>
                                            <p>Thông báo khi có cuộc gọi nhỡ</p>
                                        </div>
                                        <label className="setting-toggle">
                                            <input type="checkbox" defaultChecked />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </div>
                                    <div className="setting-item">
                                        <div className="setting-info">
                                            <h3>Báo cáo hàng ngày</h3>
                                            <p>Gửi báo cáo tổng hợp cuối ngày</p>
                                        </div>
                                        <label className="setting-toggle">
                                            <input type="checkbox" />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </div>
                                    <div className="setting-item">
                                        <div className="setting-info">
                                            <h3>Cảnh báo hệ thống</h3>
                                            <p>Thông báo khi có sự cố hoặc lỗi</p>
                                        </div>
                                        <label className="setting-toggle">
                                            <input type="checkbox" defaultChecked />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </div>
                                </div>

                                <div className="settings-actions">
                                    <button className="btn-save">
                                        <MIcon name="save" size={18} /> Lưu thay đổi
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeSection === 'security' && (
                            <div className="settings-section">
                                <h2>Bảo mật</h2>
                                <p className="settings-section-desc">Quản lý bảo mật tài khoản</p>

                                <div className="settings-group">
                                    <div className="setting-item">
                                        <div className="setting-info">
                                            <h3>Đổi mật khẩu</h3>
                                            <p>Cập nhật mật khẩu đăng nhập</p>
                                        </div>
                                        <button className="btn-outline">Đổi mật khẩu</button>
                                    </div>
                                    <div className="setting-item">
                                        <div className="setting-info">
                                            <h3>Xác thực 2 lớp</h3>
                                            <p>Bảo vệ tài khoản với xác thực 2 lớp</p>
                                        </div>
                                        <label className="setting-toggle">
                                            <input type="checkbox" />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </div>
                                    <div className="setting-item">
                                        <div className="setting-info">
                                            <h3>API Key</h3>
                                            <p>Quản lý API key cho tích hợp bên thứ 3</p>
                                        </div>
                                        <button className="btn-outline">Quản lý key</button>
                                    </div>
                                </div>

                                <div className="settings-actions">
                                    <button className="btn-save">
                                        <MIcon name="save" size={18} /> Lưu thay đổi
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeSection === 'language' && (
                            <div className="settings-section">
                                <h2>Ngôn ngữ</h2>
                                <p className="settings-section-desc">Cài đặt ngôn ngữ giao diện và AI</p>

                                <div className="settings-group">
                                    <div className="setting-item">
                                        <div className="setting-info">
                                            <h3>Ngôn ngữ giao diện</h3>
                                            <p>Ngôn ngữ hiển thị trên dashboard</p>
                                        </div>
                                        <select className="setting-select">
                                            <option>Tiếng Việt</option>
                                            <option>English</option>
                                        </select>
                                    </div>
                                    <div className="setting-item">
                                        <div className="setting-info">
                                            <h3>Ngôn ngữ AI</h3>
                                            <p>Ngôn ngữ AI sử dụng trong cuộc gọi</p>
                                        </div>
                                        <select className="setting-select">
                                            <option>Tiếng Việt</option>
                                            <option>English</option>
                                            <option>Tiếng Việt + English</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="settings-actions">
                                    <button className="btn-save">
                                        <MIcon name="save" size={18} /> Lưu thay đổi
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
