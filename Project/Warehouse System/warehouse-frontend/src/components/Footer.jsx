import React from 'react'
import { Package, Mail, Phone, MapPin } from 'lucide-react'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">

          <div className="footer-brand">
            <div className="footer-logo">
              <Package size={22} color="#667eea" />
              <span>Stock Pilot</span>
            </div>
            <p>
              An AI-powered stock management platform built for teams who
              need real-time inventory control, role-based access, and
              intelligent stock insights.
            </p>
            <div className="footer-contact">
              <div className="contact-row"><Mail size={14}/> support@stockpilot.app</div>
              <div className="contact-row"><Phone size={14}/> +92 300 0000000</div>
              <div className="contact-row"><MapPin size={14}/> Lahore, Pakistan</div>
            </div>
          </div>

          <div className="footer-col">
            <h4>System</h4>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#ai-capabilities">AI Insights</a></li>
              <li><a href="#benefits">Access Roles</a></li>
              <li><a href="#contact">Get Started</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Roles</h4>
            <ul>
              <li><span className="role-dot" style={{background:'#e74c3c'}}></span> Admin</li>
              <li><span className="role-dot" style={{background:'#8e44ad'}}></span> Manager</li>
              <li><span className="role-dot" style={{background:'#2980b9'}}></span> Supervisor</li>
              <li><span className="role-dot" style={{background:'#27ae60'}}></span> Staff</li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Modules</h4>
            <ul>
              <li><a href="#features">Inventory</a></li>
              <li><a href="#features">Stock History</a></li>
              <li><a href="#ai-capabilities">AI Analytics</a></li>
              <li><a href="#features">CSV Reports</a></li>
              <li><a href="#features">Notifications</a></li>
            </ul>
          </div>

        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Stock Pilot. All rights reserved.</p>
          <p>Built with ❤️ for warehouse teams.</p>
        </div>
      </div>
    </footer>
  )
}
