import React from 'react'
import { Package, TrendingUp, Bell, ShieldCheck } from 'lucide-react'
import './HeroSection.css'

export default function HeroSection() {
  return (
    <section className="hero">
      <div className="hero-bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      <div className="container">
        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-badge">
              <ShieldCheck size={15} /> Secure · Role-Based Access
            </div>
            <h1>
              Smart Warehouse <br />
              <span className="hero-gradient-text">Management System</span>
            </h1>
            <p>
              A complete warehouse solution with real-time inventory tracking,
              AI-powered stock insights, role-based access control, and instant
              low-stock notifications — all in one place.
            </p>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">4</span>
                <span className="stat-label">User Roles</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat">
                <span className="stat-number">AI</span>
                <span className="stat-label">Powered Insights</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat">
                <span className="stat-number">Live</span>
                <span className="stat-label">Stock Alerts</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="mockup-card">
              <div className="mockup-topbar">
                <div className="mockup-dots">
                  <span></span><span></span><span></span>
                </div>
                <span className="mockup-title">Warehouse Dashboard</span>
              </div>
              <div className="mockup-body">
                <div className="mockup-kpis">
                  <div className="mkpi blue"><Package size={16}/> 7 Items</div>
                  <div className="mkpi green"><TrendingUp size={16}/> $65k Value</div>
                  <div className="mkpi red"><Bell size={16}/> 3 Alerts</div>
                </div>
                <div className="mockup-bars">
                  <div className="mbar-row"><span>Electronics</span><div className="mbar" style={{width:'85%', background:'#667eea'}}></div></div>
                  <div className="mbar-row"><span>Office</span><div className="mbar" style={{width:'60%', background:'#27ae60'}}></div></div>
                  <div className="mbar-row"><span>Packaging</span><div className="mbar" style={{width:'45%', background:'#f39c12'}}></div></div>
                  <div className="mbar-row"><span>Materials</span><div className="mbar" style={{width:'30%', background:'#e74c3c'}}></div></div>
                </div>
                <div className="mockup-alert">
                  <Bell size={13}/> Steel Wire — Out of Stock
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
