import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { logout, getCurrentUser } from '../utils/auth'
import VideoBackground from './VideoBackground'
import './DashboardLayout.css'

// Material icon helper
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

export default function DashboardLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const user = getCurrentUser()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const isActive = (path) => location.pathname === path

  const navItems = [
    { path: '/portal', icon: 'dashboard', label: 'Tổng quan' },
    { path: '/call-history', icon: 'call_log', label: 'Lịch sử cuộc gọi' },
    { path: '/knowledge', icon: 'menu_book', label: 'Kho tri thức' },
    { path: '/settings', icon: 'settings', label: 'Cài đặt' },
  ]

  return (
    <div className="dashboard-container">
      <VideoBackground />

      {/* Click-away overlay when sidebar is expanded */}
      <div
        className={`sidebar-overlay ${!sidebarCollapsed ? 'visible' : ''}`}
        onClick={() => setSidebarCollapsed(true)}
      />

      <aside className={`dashboard-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        {/* Top Row */}
        <div className="sidebar-top-row">
          <div className="sidebar-brand" onClick={() => sidebarCollapsed && setSidebarCollapsed(false)}>
            <img src="/linh-logo.png" alt="LINH" className="sidebar-logo" />
            {!sidebarCollapsed && <span className="sidebar-brand-text">LINH AI</span>}
          </div>
          <button
            className="sidebar-collapse-btn"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? 'Mở menu' : 'Thu gọn menu'}
          >
            <MIcon name={sidebarCollapsed ? 'chevron_right' : 'chevron_left'} size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <button
              key={item.path}
              className={isActive(item.path) ? 'sidebar-nav-item active' : 'sidebar-nav-item'}
              onClick={() => navigate(item.path)}
              title={sidebarCollapsed ? item.label : ''}
            >
              <MIcon name={item.icon} className="nav-item-icon" filled={isActive(item.path)} size={22} />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-user">
          <div className="sidebar-user-avatar">{user?.name?.charAt(0) || 'N'}</div>
          {!sidebarCollapsed && (
            <>
              <div className="sidebar-user-info">
                <p className="sidebar-user-name">{user?.name}</p>
                <p className="sidebar-user-email">{user?.email}</p>
              </div>
              <button className="sidebar-logout-btn" onClick={handleLogout} title="Đăng xuất">
                <MIcon name="logout" size={18} />
              </button>
            </>
          )}
          {sidebarCollapsed && (
            <button className="sidebar-logout-btn collapsed-logout" onClick={handleLogout} title="Đăng xuất">
              <MIcon name="logout" size={18} />
            </button>
          )}
        </div>
      </aside>

      <main className="dashboard-main">
        {children}
      </main>
    </div>
  )
}
