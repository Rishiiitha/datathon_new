import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useChatStore } from '../../store/chatStore'
import './Sidebar.css'

const NAV_ITEMS = [
  { to: '/',            icon: '🏠', label: 'Dashboard',           roles: ['admin', 'supervisor', 'analyst', 'investigator', 'policymaker'] },
  { to: '/chat',        icon: '💬', label: 'Crime Intelligence',  roles: ['admin', 'supervisor', 'investigator'], highlight: true },
  { to: '/network',     icon: '🕸️', label: 'Criminal Networks',  roles: ['admin', 'supervisor', 'investigator'] },
  { to: '/analytics',   icon: '📊', label: 'Crime Analytics',    roles: ['admin', 'supervisor', 'analyst', 'policymaker'] },
  { to: '/cases',       icon: '📁', label: 'Cases',              roles: ['admin', 'supervisor', 'analyst', 'investigator'] },
  { to: '/accused',     icon: '👤', label: 'Offender Profiles',  roles: ['admin', 'supervisor', 'analyst', 'investigator'] },
  { to: '/forecasting', icon: '🔮', label: 'Crime Forecasting',  roles: ['admin', 'supervisor', 'analyst', 'policymaker'] },
  { to: '/financial',   icon: '💰', label: 'Financial Crime',    roles: ['admin', 'supervisor', 'investigator'] },
  { to: '/sociological',icon: '🧬', label: 'Social Insights',    roles: ['admin', 'supervisor', 'analyst', 'policymaker'] },
]

const ROLE_COLORS = {
  admin:        '#a78bfa',
  supervisor:   '#38bdf8',
  analyst:      '#34d399',
  investigator: '#fbbf24',
  policymaker:  '#fb923c',
}

export default function Sidebar({ collapsed, onToggle }) {
  const { user, role, logout } = useAuthStore()
  const navigate = useNavigate()

  const userRole = (role || 'investigator').toLowerCase()

  function handleLogout() {
    useChatStore.getState().clearSession()
    logout()
    navigate('/login')
  }

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : userRole.slice(0,2).toUpperCase()

  const visibleNavItems = NAV_ITEMS.filter(item => 
    !item.roles || item.roles.includes(userRole)
  )

  return (
    <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🛡️</div>
        {!collapsed && (
          <div className="sidebar-logo-text">
            <span className="gradient-text">CrimeIQ</span>
            <span className="sidebar-logo-sub">Karnataka Police</span>
          </div>
        )}
        <button className="sidebar-toggle btn btn-ghost btn-icon" onClick={onToggle}
          data-tooltip={collapsed ? 'Expand' : 'Collapse'}>
          {collapsed ? '›' : '‹'}
        </button>
      </div>

      <div className="divider" />

      {/* Navigation */}
      <nav className="sidebar-nav">
        {visibleNavItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `sidebar-nav-item${isActive ? ' active' : ''}${item.highlight ? ' highlight' : ''}`
            }
            data-tooltip={collapsed ? item.label : undefined}
          >
            <span className="sidebar-nav-icon">{item.icon}</span>
            {!collapsed && <span className="sidebar-nav-label">{item.label}</span>}
          </NavLink>
        ))}

        {userRole === 'admin' && (
          <NavLink
            to="/admin"
            className={({ isActive }) => `sidebar-nav-item${isActive ? ' active' : ''}`}
            data-tooltip={collapsed ? 'Admin' : undefined}
          >
            <span className="sidebar-nav-icon">⚙️</span>
            {!collapsed && <span className="sidebar-nav-label">Admin</span>}
          </NavLink>
        )}
      </nav>

      {/* User section */}
      <div className="sidebar-user">
        <div className="sidebar-user-avatar" style={{ background: ROLE_COLORS[userRole] || '#38bdf8' }}>
          {initials}
        </div>
        {!collapsed && (
          <div className="sidebar-user-info">
            <div className="sidebar-user-email">{user?.email || 'Demo User'}</div>
            <span className="badge badge-cyan" style={{ fontSize: '0.7rem', textTransform: 'capitalize' }}>
              {userRole}
            </span>
          </div>
        )}
        <button
          className="btn btn-ghost btn-icon sidebar-logout"
          onClick={handleLogout}
          data-tooltip="Sign Out"
          title="Sign Out"
        >
          ⏻
        </button>
      </div>
    </aside>
  )
}
