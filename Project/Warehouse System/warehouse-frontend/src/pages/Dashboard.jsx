import React, { useState, useEffect } from 'react'
import {
  Package, BarChart2, History, Users, User,
  LogOut, Menu, X, Home, Bell, FileDown, LayoutDashboard
} from 'lucide-react'
import HomeTab           from './tabs/HomeTab'
import InventoryTab      from './tabs/InventoryTab'
import AIInsightsTab     from './tabs/AIInsightsTab'
import StockHistoryTab   from './tabs/StockHistoryTab'
import UserManagementTab from './tabs/UserManagementTab'
import ProfileTab        from './tabs/ProfileTab'
import NotificationsTab  from './tabs/NotificationsTab'
import ReportsTab        from './tabs/ReportsTab'
import { api }           from '../services/api'
import ChatBot           from '../components/ChatBot'
import './Dashboard.css'

const ROLE_TABS = {
  admin:      ['home', 'inventory', 'stock', 'ai', 'reports', 'notifications', 'users', 'profile'],
  manager:    ['home', 'inventory', 'stock', 'ai', 'reports', 'notifications', 'profile'],
  supervisor: ['home', 'inventory', 'stock', 'notifications', 'profile'],
  staff:      ['home', 'inventory', 'stock', 'notifications', 'profile'],
}

const TAB_META = {
  home:          { label: 'Overview',        icon: LayoutDashboard },
  inventory:     { label: 'Inventory',       icon: Package },
  stock:         { label: 'Stock History',   icon: History },
  ai:            { label: 'AI Insights',     icon: BarChart2 },
  reports:       { label: 'Reports',         icon: FileDown },
  notifications: { label: 'Notifications',   icon: Bell },
  users:         { label: 'User Management', icon: Users },
  profile:       { label: 'My Profile',      icon: User },
}

const ROLE_COLORS = {
  admin: '#e74c3c', manager: '#8e44ad', supervisor: '#2980b9', staff: '#27ae60'
}

export default function Dashboard({ user, onLogout, onNavigateToHome, onUserUpdate }) {
  const role        = user?.role || 'staff'
  const allowedTabs = ROLE_TABS[role] || ROLE_TABS.staff
  const [activeTab, setActiveTab]         = useState(allowedTabs[0])
  const [sidebarOpen, setSidebarOpen]     = useState(true)
  const [notifCount, setNotifCount]       = useState(0)

  // Fetch notification badge count
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await api.get('/dashboard/notifications')
        setNotifCount(res.unreadCount || 0)
      } catch {}
    }
    fetchCount()
    const t = setInterval(fetchCount, 60000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className={`dashboard-shell ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Package size={28} />
            {sidebarOpen && <span>Stock Pilot</span>}
          </div>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {sidebarOpen && (
          <div className="sidebar-user">
            <div className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
            <div className="user-info">
              <span className="user-name">{user?.name}</span>
              <span className="user-role-badge" style={{ background: ROLE_COLORS[role] }}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </span>
            </div>
          </div>
        )}

        <nav className="sidebar-nav">
          {allowedTabs.map((tab) => {
            const { label, icon: Icon } = TAB_META[tab]
            const isNotif = tab === 'notifications'
            return (
              <button
                key={tab}
                className={`nav-item ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
                title={!sidebarOpen ? label : ''}
              >
                <span style={{ position: 'relative', display: 'inline-flex' }}>
                  <Icon size={20} />
                  {isNotif && notifCount > 0 && (
                    <span className="nav-badge">{notifCount > 9 ? '9+' : notifCount}</span>
                  )}
                </span>
                {sidebarOpen && <span>{label}</span>}
                {sidebarOpen && isNotif && notifCount > 0 && (
                  <span className="nav-badge-label">{notifCount}</span>
                )}
              </button>
            )
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item" onClick={onNavigateToHome} title="Home">
            <Home size={20} />
            {sidebarOpen && <span>Home</span>}
          </button>
          <button className="nav-item logout" onClick={onLogout} title="Logout">
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="dashboard-main">
        <div className="dashboard-topbar">
          <h2 className="topbar-title">{TAB_META[activeTab]?.label}</h2>
          <div className="topbar-right">
            {notifCount > 0 && (
              <button
                className="topbar-notif-btn"
                onClick={() => setActiveTab('notifications')}
                title="View notifications"
              >
                <Bell size={18} />
                <span className="topbar-notif-count">{notifCount}</span>
              </button>
            )}
            <span className="topbar-user">Welcome, <strong>{user?.name}</strong></span>
          </div>
        </div>

        <div className="dashboard-content">
          {activeTab === 'home'          && <HomeTab user={user} />}
          {activeTab === 'inventory'     && <InventoryTab user={user} />}
          {activeTab === 'stock'         && <StockHistoryTab user={user} />}
          {activeTab === 'ai'            && <AIInsightsTab />}
          {activeTab === 'reports'       && <ReportsTab user={user} />}
          {activeTab === 'notifications' && <NotificationsTab />}
          {activeTab === 'users'         && role === 'admin' && <UserManagementTab currentUser={user} />}
          {activeTab === 'profile'       && <ProfileTab user={user} onUserUpdate={onUserUpdate} />}
        </div>
      </main>

      {/* RAG Chatbot — available to all roles */}
      <ChatBot user={user} />
    </div>
  )
}
