import { useNavigate, useLocation } from 'react-router-dom'
import { logout, getCurrentUser } from '../utils/auth'
import { IconDashboard, IconConversation, IconAgent, IconSettings, IconLogout } from './DashboardIcons'
import AnimatedBackground from './AnimatedBackground'
import './DashboardLayout.css'

export default function DashboardLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const user = getCurrentUser()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const isActive = (path) => location.pathname === path

  return (
    <div className="dashboard-container">
      <AnimatedBackground />
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <img src="/linh-logo.png" alt="LINH" className="sidebar-logo" />
          <span className="sidebar-brand-text">LINH AI</span>
        </div>

        <nav className="sidebar-nav">
          <button
            className={isActive('/portal') ? 'sidebar-nav-item active' : 'sidebar-nav-item'}
            onClick={() => navigate('/portal')}
          >
            <IconDashboard className="nav-item-icon" />
            <span>Tổng quan</span>
          </button>
          <button
            className={isActive('/call-history') ? 'sidebar-nav-item active' : 'sidebar-nav-item'}
            onClick={() => navigate('/call-history')}
          >
            <IconConversation className="nav-item-icon" />
            <span>Lịch sử cuộc gọi</span>
          </button>
          <button
            className={isActive('/agents') ? 'sidebar-nav-item active' : 'sidebar-nav-item'}
            onClick={() => navigate('/agents')}
          >
            <IconAgent className="nav-item-icon" />
            <span>Agents</span>
          </button>
          <button
            className={isActive('/settings') ? 'sidebar-nav-item active' : 'sidebar-nav-item'}
            onClick={() => navigate('/settings')}
          >
            <IconSettings className="nav-item-icon" />
            <span>Cài đặt</span>
          </button>
        </nav>

        <div className="sidebar-user">
          <div className="sidebar-user-avatar">{user?.name?.charAt(0) || 'N'}</div>
          <div className="sidebar-user-info">
            <p className="sidebar-user-name">{user?.name}</p>
            <p className="sidebar-user-email">{user?.email}</p>
          </div>
          <button className="sidebar-logout-btn" onClick={handleLogout} title="Đăng xuất">
            <IconLogout />
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        {children}
      </main>
    </div>
  )
}
