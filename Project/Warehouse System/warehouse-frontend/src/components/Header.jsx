import React, { useState } from 'react'
import { Menu, X, LayoutDashboard } from 'lucide-react'
import './Header.css'

export default function Header({ 
  isAuthenticated, 
  user, 
  onLogout, 
  onNavigateToLogin, 
  onNavigateToSignup,
  onNavigateToAdmin,
  onNavigateToAI
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">📦</span>
            <span className="logo-text">Stock Pilot</span>
          </div>
          
          <nav className={`nav ${isMenuOpen ? 'active' : ''}`}>
            <a href="#features">Features</a>
            <a href="#ai-capabilities">AI Features</a>
            <a href="#benefits">Benefits</a>
            <a href="#contact">Contact</a>
          </nav>

          <div className="header-actions">
            {isAuthenticated && user ? (
              <>
                <div className="user-info">
                  <span className="user-name">{user.name}</span>
                  <span className="user-role">{user.role}</span>
                </div>
                <button className="btn-admin" onClick={onNavigateToAdmin}>
                  <LayoutDashboard size={18} /> Go to Dashboard
                </button>
                <button className="btn-secondary" onClick={onLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <button className="btn-secondary" onClick={onNavigateToLogin}>
                  Login
                </button>
                <button className="btn-primary" onClick={onNavigateToSignup}>
                  Get Started
                </button>
              </>
            )}
            <button 
              className="menu-toggle"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
