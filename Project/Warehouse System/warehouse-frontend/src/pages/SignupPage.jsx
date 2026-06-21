import React, { useState } from 'react'
import { authService } from '../services/authService'
import './SignupPage.css'

export default function SignupPage({ onSignupSuccess, onNavigateToLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
    role: 'staff'
  })

  const [verificationEmail, setVerificationEmail] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [step, setStep] = useState('signup') // signup, verification
  const [showPassword, setShowPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)

  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Calculate password strength
    if (name === 'password') {
      calculatePasswordStrength(value)
    }
  }

  const calculatePasswordStrength = (password) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[!@#$%^&*]/.test(password)) strength++
    setPasswordStrength(strength)
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required')
      return false
    }
    if (formData.name.trim().length < 2) {
      setError('Name must be at least 2 characters')
      return false
    }
    if (!formData.email.trim()) {
      setError('Email is required')
      return false
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Invalid email format')
      return false
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required')
      return false
    }
    if (formData.phone.trim().length < 10) {
      setError('Phone number must be at least 10 digits')
      return false
    }
    if (!formData.address.trim()) {
      setError('Address is required')
      return false
    }
    if (!formData.password.trim()) {
      setError('Password is required')
      return false
    }
    if (!passwordRegex.test(formData.password)) {
      setError('Password must be at least 8 characters with 1 uppercase letter and 1 number')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    if (!agreeTerms) {
      setError('You must agree to the Terms and Conditions')
      return false
    }
    return true
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      const response = await authService.signup({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        password: formData.password,
        role: formData.role
      })

      setSuccess(response.message)
      setVerificationEmail(formData.email)
      setStep('verification')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyEmail = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!verificationCode.trim()) {
      setError('Verification code is required')
      return
    }

    setLoading(true)
    try {
      const response = await authService.verifyEmail(verificationEmail, verificationCode)
      setSuccess(response.message)
      setTimeout(() => {
        onSignupSuccess()
      }, 1500)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      await authService.resendVerificationCode(verificationEmail)
      setSuccess('Verification code resent to your email')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getPasswordStrengthText = () => {
    const strengths = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong']
    return strengths[passwordStrength - 1] || 'Very Weak'
  }

  const getPasswordStrengthColor = () => {
    const colors = ['#d32f2f', '#f57c00', '#fbc02d', '#7cb342', '#388e3c']
    return colors[passwordStrength - 1] || '#d32f2f'
  }

  return (
    <div className="signup-container">
      <div className="signup-card">
        {step === 'signup' ? (
          <>
            <div className="signup-header">
              <h1>Create Account</h1>
              <p>Join Stock Pilot — your warehouse management system</p>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <form onSubmit={handleSignup} className="signup-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="1234567890"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="you@example.com"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">Address *</label>
                <input
                  id="address"
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="123 Main St, City, State"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="role">Warehouse Role *</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  disabled={loading}
                >
                  <option value="staff">Staff</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="password">Password *</label>
                <div className="password-input-group">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter a strong password"
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
                {formData.password && (
                  <div className="password-strength">
                    <div className="strength-bar">
                      <div
                        className="strength-fill"
                        style={{
                          width: `${(passwordStrength / 4) * 100}%`,
                          backgroundColor: getPasswordStrengthColor()
                        }}
                      ></div>
                    </div>
                    <span style={{ color: getPasswordStrengthColor() }}>
                      Strength: {getPasswordStrengthText()}
                    </span>
                  </div>
                )}
                <p className="hint">
                  At least 8 characters, 1 uppercase letter, and 1 number required
                </p>
              </div>

              <div className="form-group">
                <label htmlFor="confirm-password">Confirm Password *</label>
                <input
                  id="confirm-password"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Re-enter your password"
                  disabled={loading}
                />
              </div>

              <div className="form-group checkbox">
                <input
                  id="terms"
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  disabled={loading}
                />
                <label htmlFor="terms">
                  I agree to the{' '}
                  <a href="#terms" onClick={(e) => e.preventDefault()}>
                    Terms and Conditions
                  </a>{' '}
                  *
                </label>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="divider">or</div>

            <div className="login-prompt">
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  className="link-button"
                  onClick={onNavigateToLogin}
                >
                  Sign In
                </button>
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="signup-header">
              <h1>Verify Email</h1>
              <p>Enter the verification code sent to your email</p>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <form onSubmit={handleVerifyEmail} className="signup-form">
              <div className="form-group">
                <p className="email-display">
                  Verification code sent to: <strong>{verificationEmail}</strong>
                </p>
              </div>

              <div className="form-group">
                <label htmlFor="verification-code">6-Digit Code *</label>
                <input
                  id="verification-code"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength="6"
                  disabled={loading}
                  className="code-input"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify Email'}
              </button>
            </form>

            <div className="verification-footer">
              <p>Didn't receive the code?</p>
              <button
                type="button"
                className="link-button"
                onClick={handleResendCode}
                disabled={loading}
              >
                Resend Code
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
