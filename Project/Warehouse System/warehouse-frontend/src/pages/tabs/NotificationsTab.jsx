import React, { useState, useEffect } from 'react'
import { AlertTriangle, ArrowDownCircle, ArrowUpCircle, RefreshCw, Bell, CheckCheck } from 'lucide-react'
import { api } from '../../services/api'
import './TabShared.css'
import './NotificationsTab.css'

const SEV_META = {
  critical: { color: '#e74c3c', bg: '#ffebee', icon: '🔴', label: 'Critical' },
  warning:  { color: '#f39c12', bg: '#fff8e1', icon: '🟡', label: 'Warning' },
  info:     { color: '#3498db', bg: '#ebf5fb', icon: '🔵', label: 'Info' },
}

export default function NotificationsTab() {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount]     = useState(0)
  const [loading, setLoading]             = useState(false)
  const [filter, setFilter]               = useState('all')   // all | low_stock | movement
  const [dismissed, setDismissed]         = useState(() => {
    try { return JSON.parse(localStorage.getItem('dismissedNotifs') || '[]') } catch { return [] }
  })

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/dashboard/notifications')
      setNotifications(res.notifications)
      setUnreadCount(res.unreadCount)
    } catch {}
    setLoading(false)
  }

  const dismiss = (id) => {
    const next = [...dismissed, id]
    setDismissed(next)
    localStorage.setItem('dismissedNotifs', JSON.stringify(next))
  }

  const dismissAll = () => {
    const ids = visible.map(n => n.id)
    const next = [...dismissed, ...ids]
    setDismissed(next)
    localStorage.setItem('dismissedNotifs', JSON.stringify(next))
  }

  const visible = notifications
    .filter(n => !dismissed.includes(n.id))
    .filter(n => filter === 'all' || n.type === filter)

  const counts = {
    all:        notifications.filter(n => !dismissed.includes(n.id)).length,
    low_stock:  notifications.filter(n => !dismissed.includes(n.id) && n.type === 'low_stock').length,
    movement:   notifications.filter(n => !dismissed.includes(n.id) && n.type === 'movement').length,
  }

  return (
    <div className="tab-container">
      <div className="tab-header-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <h3 className="tab-section-title">Notifications</h3>
          {unreadCount > 0 && (
            <span className="notif-badge">{unreadCount} low stock</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {visible.length > 0 && (
            <button className="btn-secondary-sm" onClick={dismissAll}>
              <CheckCheck size={15} /> Dismiss All
            </button>
          )}
          <button className="btn-primary-sm" onClick={load} disabled={loading}>
            <RefreshCw size={15} className={loading ? 'spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="notif-filters">
        {[
          { key: 'all',       label: 'All',          icon: Bell },
          { key: 'low_stock', label: 'Low Stock',    icon: AlertTriangle },
          { key: 'movement',  label: 'Stock Moves',  icon: ArrowDownCircle },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            className={`notif-filter-btn ${filter === key ? 'active' : ''}`}
            onClick={() => setFilter(key)}
          >
            <Icon size={15} /> {label}
            <span className="notif-count">{counts[key]}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="tab-loading">Loading notifications...</div>
      ) : visible.length === 0 ? (
        <div className="notif-empty">
          <Bell size={48} color="#ddd" />
          <p>No notifications</p>
          <span>You're all caught up!</span>
        </div>
      ) : (
        <div className="notif-list">
          {visible.map(n => {
            const sev = SEV_META[n.severity] || SEV_META.info
            return (
              <div key={n.id} className="notif-item" style={{ borderLeftColor: sev.color, background: sev.bg + '55' }}>
                <div className="notif-icon">{sev.icon}</div>
                <div className="notif-body">
                  <div className="notif-title">
                    <strong>{n.title}</strong>
                    <span className="notif-sev-tag" style={{ background: sev.color }}>{sev.label}</span>
                  </div>
                  <div className="notif-msg">{n.message}</div>
                  {n.time && (
                    <div className="notif-time">{new Date(n.time).toLocaleString()}</div>
                  )}
                </div>
                <button className="notif-dismiss" onClick={() => dismiss(n.id)} title="Dismiss">×</button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
