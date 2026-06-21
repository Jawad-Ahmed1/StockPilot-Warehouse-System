import React from 'react'
import { LogIn, UserPlus, Package } from 'lucide-react'
import './CallToActionSection.css'

export default function CallToActionSection() {
  return (
    <section id="contact" className="cta-section">
      <div className="cta-bg-glow"></div>
      <div className="container">
        <div className="cta-content">
          <div className="cta-icon-wrap">
            <Package size={40} color="white" />
          </div>
          <h2>Ready to Take Control of Your Warehouse?</h2>
          <p>
            Sign up for an account, get verified, and your team can start
            managing inventory, tracking stock, and acting on AI insights
            within minutes.
          </p>

          <div className="cta-steps">
            <div className="cta-step">
              <div className="step-num">1</div>
              <span>Create your account with your work email</span>
            </div>
            <div className="cta-arrow">→</div>
            <div className="cta-step">
              <div className="step-num">2</div>
              <span>Verify via the OTP sent to your inbox</span>
            </div>
            <div className="cta-arrow">→</div>
            <div className="cta-step">
              <div className="step-num">3</div>
              <span>Log in and start managing your warehouse</span>
            </div>
          </div>

          <div className="cta-actions">
            <div className="cta-action-note">
              <UserPlus size={18} />
              <span>New to the system? Ask your admin to create your account or sign up directly.</span>
            </div>
            <div className="cta-action-note">
              <LogIn size={18} />
              <span>Already have an account? Use the Login button at the top of the page.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
