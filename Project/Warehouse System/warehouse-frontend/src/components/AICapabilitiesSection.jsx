import React from 'react'
import { TrendingUp, AlertTriangle, Zap, BarChart2 } from 'lucide-react'
import './AICapabilitiesSection.css'

const capabilities = [
  {
    icon: TrendingUp,
    color: '#667eea',
    title: 'Fast-Selling Detection',
    description: 'Automatically identifies your highest-velocity products by analysing 30-day sales patterns.',
    points: ['Units sold per day ranking', 'Revenue per item (30 days)', 'Days until stockout estimate']
  },
  {
    icon: AlertTriangle,
    color: '#e74c3c',
    title: 'Low Stock Intelligence',
    description: 'Goes beyond a simple threshold — calculates actual days remaining based on daily consumption.',
    points: ['OUT OF STOCK / LOW / MEDIUM levels', 'Daily consumption rate', 'Stockout countdown in days']
  },
  {
    icon: Zap,
    color: '#f39c12',
    title: 'Sales Velocity Metrics',
    description: 'Classifies every product from SLOW to VERY FAST so you always know what needs attention.',
    points: ['VERY FAST / FAST / MODERATE / SLOW', 'Revenue per day per item', 'Sales rank across all products']
  },
  {
    icon: BarChart2,
    color: '#27ae60',
    title: 'Dashboard Analytics',
    description: 'Visual overview with charts across categories, stock value distribution, and movement trends.',
    points: ['Inventory value by category (bar)', 'Stock distribution (pie chart)', 'Movement trend (last 7 days)']
  }
]

export default function AICapabilitiesSection() {
  return (
    <section id="ai-capabilities" className="ai-section">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">AI Insights</span>
          <h2>Intelligence Built Into Every Decision</h2>
          <p>Your warehouse data turns into actionable signals — no configuration needed</p>
        </div>

        <div className="ai-grid">
          {capabilities.map((cap, i) => {
            const Icon = cap.icon
            return (
              <div key={i} className="ai-card">
                <div className="ai-card-icon" style={{ background: cap.color }}>
                  <Icon size={28} color="white" />
                </div>
                <div className="ai-card-body">
                  <h3>{cap.title}</h3>
                  <p>{cap.description}</p>
                  <ul>
                    {cap.points.map((pt, j) => (
                      <li key={j}>
                        <span className="check" style={{ color: cap.color }}>✓</span> {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
