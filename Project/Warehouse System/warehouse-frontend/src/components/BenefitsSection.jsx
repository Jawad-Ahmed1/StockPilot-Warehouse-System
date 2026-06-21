import React from 'react'
import { ShieldCheck, Eye, Clock, UserCheck } from 'lucide-react'
import './BenefitsSection.css'

const roles = [
  { role: 'Admin',      color: '#e74c3c', perms: ['Full system access', 'Manage all users', 'Change roles & status', 'All reports & exports'] },
  { role: 'Manager',    color: '#8e44ad', perms: ['Add, edit, delete items', 'AI Insights access', 'Export all reports', 'View all stock history'] },
  { role: 'Supervisor', color: '#2980b9', perms: ['Add & edit items', 'Log stock movements', 'View notifications', 'Update own profile'] },
  { role: 'Staff',      color: '#27ae60', perms: ['View inventory', 'Log stock movements', 'View notifications', 'Update own profile'] },
]

const benefits = [
  { icon: ShieldCheck, color: '#667eea', title: 'Secure by Design',    desc: 'Every API endpoint is protected with JWT authentication. Roles are enforced both in the UI and on the server.' },
  { icon: Eye,         color: '#27ae60', title: 'Full Audit Trail',    desc: 'Every stock movement is logged with before/after quantities, reason, and timestamp — nothing is ever lost.' },
  { icon: Clock,       color: '#f39c12', title: 'Real-Time Updates',   desc: 'Stock levels update instantly after every movement. Notifications refresh automatically every minute.' },
  { icon: UserCheck,   color: '#e74c3c', title: 'Team Ready',          desc: 'Built for teams of any size. Create accounts for your whole team, assign roles, and control access instantly.' },
]

export default function BenefitsSection() {
  return (
    <section id="benefits" className="benefits-section">
      <div className="container">
        {/* Role permissions table */}
        <div className="section-header">
          <span className="section-tag">Access Control</span>
          <h2>The Right Access for Every Team Member</h2>
          <p>Four distinct roles — each with exactly the permissions they need</p>
        </div>

        <div className="roles-grid">
          {roles.map((r, i) => (
            <div key={i} className="role-card" style={{ '--rc': r.color }}>
              <div className="role-header" style={{ background: r.color }}>
                <strong>{r.role}</strong>
              </div>
              <ul>
                {r.perms.map((p, j) => (
                  <li key={j}><span style={{ color: r.color }}>✓</span> {p}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Benefits */}
        <div className="section-header" style={{ marginTop: '80px' }}>
          <span className="section-tag">Why It Works</span>
          <h2>Built for Real Warehouse Operations</h2>
          <p>Designed around the problems warehouse teams actually face every day</p>
        </div>

        <div className="benefits-grid">
          {benefits.map((b, i) => {
            const Icon = b.icon
            return (
              <div key={i} className="benefit-card">
                <div className="benefit-icon" style={{ background: b.color + '15', color: b.color }}>
                  <Icon size={24} />
                </div>
                <h3>{b.title}</h3>
                <p>{b.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
