import React, { useState, useEffect } from 'react'
import { authService } from '../services/authService'
import './LoginPage.css'

export default function LoginPage({ onLoginSuccess, onNavigateToSignup }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetCode, setResetCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [resetStep, setResetStep] = useState('email') // email, code, password
  const [resetLoading, setResetLoading] = useState(false)

  // Load remembered email on mount
  useEffect(() => {
    const remembered = authService.getRememberedEmail()
    if (remembered) {
      setEmail(remembered)
      setRememberMe(true)
    }
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validation
    if (!email.trim()) {
      setError('Email is required')
      return
    }
    if (!password.trim()) {
      setError('Password is required')
      return
    }

    setLoading(true)
    try {
      const response = await authService.login(email, password, rememberMe)
      setSuccess(response.message)
      setTimeout(() => {
        onLoginSuccess(response.user)
      }, 1000)
    } catch (err) {
      // If the account exists but email isn't verified, let the user know clearly
      if (err.requiresVerification) {
        setError('Your email is not verified. Please check your inbox for the verification code.')
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleRequestReset = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!resetEmail.trim()) {
      setError('Email is required')
      return
    }

    setResetLoading(true)
    try {
      await authService.requestPasswordReset(resetEmail)
      setSuccess('Verification code sent to your email')
      setResetStep('code')
    } catch (err) {
      setError(err.message)
    } finally {
      setResetLoading(false)
    }
  }

  const handleVerifyResetCode = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!resetCode.trim()) {
      setError('Verification code is required')
      return
    }

    setResetStep('password')
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!newPassword.trim()) {
      setError('New password is required')
      return
    }

    setResetLoading(true)
    try {
      await authService.resetPassword(resetEmail, resetCode, newPassword)
      setSuccess('Password reset successfully! Redirecting to login...')
      setTimeout(() => {
        setShowForgotPassword(false)
        setResetStep('email')
        setResetEmail('')
        setResetCode('')
        setNewPassword('')
      }, 1500)
    } catch (err) {
      setError(err.message)
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <div className="login-container">
      {/* Left branding panel */}
      <div className="login-left">
        <div className="login-brand">
          <span className="login-brand-icon">📦</span>
          Stock Pilot
        </div>
        <div className="login-tagline">
          <h2>Your Warehouse,<br /><span>Fully in Control</span></h2>
          <p>Manage inventory, track stock movements, get AI-powered alerts, and control your team's access — all from one dashboard.</p>
          <div className="login-features">
            <div className="login-feature-item"><span className="login-feature-dot"></span> Role-based access for your whole team</div>
            <div className="login-feature-item"><span className="login-feature-dot"></span> Real-time low stock notifications</div>
            <div className="login-feature-item"><span className="login-feature-dot"></span> AI insights & sales velocity tracking</div>
            <div className="login-feature-item"><span className="login-feature-dot"></span> Full stock movement audit trail</div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="login-right">
        <div className="login-card">
        {!showForgotPassword ? (
          <>
            <div className="login-header">
              <h1>Stock Pilot</h1>
              <p>Sign in to your account</p>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <form onSubmit={handleLogin} className="login-form">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="password-input-group">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              <div className="form-group checkbox">
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                />
                <label htmlFor="remember">Remember me</label>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="login-footer">
              <button
                type="button"
                className="link-button"
                onClick={() => setShowForgotPassword(true)}
              >
                Forgot Password?
              </button>
            </div>

            <div className="divider">or</div>

            <div className="signup-prompt">
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  className="link-button"
                  onClick={onNavigateToSignup}
                >
                  Sign Up
                </button>
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="login-header">
              <h1>Reset Password</h1>
              <p>Recover your account access</p>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {resetStep === 'email' && (
              <form onSubmit={handleRequestReset} className="login-form">
                <div className="form-group">
                  <label htmlFor="reset-email">Email Address</label>
                  <input
                    id="reset-email"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    disabled={resetLoading}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={resetLoading}
                >
                  {resetLoading ? 'Sending...' : 'Send Reset Code'}
                </button>
              </form>
            )}

            {resetStep === 'code' && (
              <form onSubmit={handleVerifyResetCode} className="login-form">
                <div className="form-group">
                  <label htmlFor="reset-code">Verification Code</label>
                  <p className="hint">Check your email for a 6-digit code</p>
                  <input
                    id="reset-code"
                    type="text"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength="6"
                    disabled={resetLoading}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={resetLoading}
                >
                  Verify Code
                </button>
              </form>
            )}

            {resetStep === 'password' && (
              <form onSubmit={handleResetPassword} className="login-form">
                <div className="form-group">
                  <label htmlFor="new-password">New Password</label>
                  <div className="password-input-group">
                    <input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      disabled={resetLoading}
                    />
                  </div>
                  <p className="hint">
                    At least 8 characters, 1 uppercase letter, and 1 number required
                  </p>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={resetLoading}
                >
                  {resetLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            )}

            <button
              type="button"
              className="link-button"
              onClick={() => {
                setShowForgotPassword(false)
                setResetStep('email')
                setResetEmail('')
                setResetCode('')
                setNewPassword('')
                setError('')
                setSuccess('')
              }}
            >
              Back to Login
            </button>
          </>
        )}
        </div>
      </div>
    </div>
  )
}
