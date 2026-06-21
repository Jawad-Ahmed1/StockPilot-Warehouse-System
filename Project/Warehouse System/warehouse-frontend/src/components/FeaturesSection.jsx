import React from 'react'
import { Package, History, Bell, BarChart2, Users, FileDown } from 'lucide-react'
import './FeaturesSection.css'

const features = [
  {
    icon: Package,
    color: '#667eea',
    title: 'Inventory Management',
    description: 'Add, edit and delete products with full details — SKU, category, supplier, price, and warehouse location. Role-based controls ensure only the right people can make changes.'
  },
  {
    icon: History,
    color: '#27ae60',
    title: 'Stock Movement Log',
    description: 'Record every stock IN, OUT, or ADJUSTMENT with reasons and notes. Full audit trail shows before and after quantities for complete accountability.'
  },
  {
    icon: Bell,
    color: '#e74c3c',
    title: 'Live Notifications',
    description: 'Automatic alerts for out-of-stock and low stock items. Critical items are flagged in real time so your team can act before operations are disrupted.'
  },
  {
    icon: BarChart2,
    color: '#f39c12',
    title: 'AI Insights & Analytics',
    description: 'Sales velocity, fast-selling item rankings, and days-to-stockout predictions powered by your own sales data — no guesswork required.'
  },
  {
    icon: Users,
    color: '#8e44ad',
    title: 'Role-Based Access',
    description: 'Four roles — Admin, Manager, Supervisor, Staff — each with precise permissions. Staff can log movements, supervisors can add stock, managers can delete, admins control everything.'
  },
  {
    icon: FileDown,
    color: '#1abc9c',
    title: 'Reports & CSV Export',
    description: 'Export full inventory, low stock report, stock movement history, and sales velocity data as CSV — ready to open in Excel or Google Sheets instantly.'
  }
]

export default function FeaturesSection() {
  return (
    <section id="features" className="features">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">What's Inside</span>
          <h2>Everything Your Warehouse Needs</h2>
          <p>Built around real warehouse workflows — not generic software templates</p>
        </div>
        <div className="features-grid">
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <div key={i} className="feature-card" style={{ '--accent': f.color }}>
                <div className="feature-icon-wrap" style={{ background: f.color + '15', color: f.color }}>
                  <Icon size={26} />
                </div>
                <h3>{f.title}</h3>
                <p>{f.description}</p>
                <div className="feature-accent-line" style={{ background: f.color }}></div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
