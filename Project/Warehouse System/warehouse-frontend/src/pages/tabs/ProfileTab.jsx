import React, { useState, useEffect } from 'react'
import { Save, Lock, AlertCircle, CheckCircle } from 'lucide-react'
import { api } from '../../services/api'
import './TabShared.css'

const ROLE_COLORS = { admin: '#e74c3c', manager: '#8e44ad', supervisor: '#2980b9', staff: '#27ae60' }

export default function ProfileTab({ user, onUserUpdate }) {
  const [profile, setProfile] = useState({ name: '', phone: '', address: '' })
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')
  const [passError, setPassError] = useState('')
  const [passSuccess, setPassSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [passLoading, setPassLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const data = await api.get('/users/profile')
      setProfile({ name: data.data.name, phone: data.data.phone || '', address: data.data.address || '' })
    } catch {}
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setProfileError(''); setProfileSuccess('')
    setLoading(true)
    try {
      await api.put('/users/profile', profile)
      setProfileSuccess('Profile updated successfully')
      // Update localStorage user
      const stored = JSON.parse(localStorage.getItem('currentUser') || '{}')
      const updated = { ...stored, name: profile.name, phone: profile.phone, address: profile.address }
      localStorage.setItem('currentUser', JSON.stringify(updated))
      onUserUpdate(updated)
    } catch (err) {
      setProfileError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPassError(''); setPassSuccess('')
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPassError('New passwords do not match')
      return
    }
    setPassLoading(true)
    try {
      await api.put('/users/profile/password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      })
      setPassSuccess('Password changed successfully')
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setPassError(err.message)
    } finally {
      setPassLoading(false)
    }
  }

  const role = user?.role || 'staff'

  return (
    <div className="tab-container">
      <div className="profile-layout">
        {/* Left — Avatar + Info */}
        <div className="profile-card">
          <div className="profile-avatar" style={{ background: `linear-gradient(135deg, ${ROLE_COLORS[role]}, #764ba2)` }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <h3 className="profile-name">{user?.name}</h3>
          <span className="role-badge" style={{ background: ROLE_COLORS[role] }}>
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </span>
          <div className="profile-meta">
            <div className="meta-row"><span>Email</span><strong>{user?.email}</strong></div>
            <div className="meta-row"><span>Member since</span><strong>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</strong></div>
          </div>
        </div>

        {/* Right — Forms */}
        <div className="profile-forms">
          {/* Edit Profile */}
          <div className="form-card">
            <h4 className="form-card-title"><Save size={18}/> Edit Profile</h4>
            {profileError && <div className="tab-error"><AlertCircle size={15}/> {profileError}</div>}
            {profileSuccess && <div className="tab-success"><CheckCircle size={15}/> {profileSuccess}</div>}
            <form onSubmit={handleSaveProfile}>
              <div className="form-grid">
                <div className="fg fg-full">
                  <label>Full Name *</label>
                  <input required value={profile.name} onChange={e => setProfile(p => ({...p, name: e.target.value}))} placeholder="Your name" />
                </div>
                <div className="fg fg-full">
                  <label>Phone Number</label>
                  <input value={profile.phone} onChange={e => setProfile(p => ({...p, phone: e.target.value}))} placeholder="1234567890" />
                </div>
                <div className="fg fg-full">
                  <label>Address</label>
                  <input value={profile.address} onChange={e => setProfile(p => ({...p, address: e.target.value}))} placeholder="123 Main St, City" />
                </div>
              </div>
              <button type="submit" className="btn-primary-sm" disabled={loading} style={{ marginTop: '1rem' }}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div className="form-card">
            <h4 className="form-card-title"><Lock size={18}/> Change Password</h4>
            {passError && <div className="tab-error"><AlertCircle size={15}/> {passError}</div>}
            {passSuccess && <div className="tab-success"><CheckCircle size={15}/> {passSuccess}</div>}
            <form onSubmit={handleChangePassword}>
              <div className="form-grid">
                <div className="fg fg-full">
                  <label>Current Password *</label>
                  <input required type={showPass ? 'text' : 'password'} value={passwords.currentPassword}
                    onChange={e => setPasswords(p => ({...p, currentPassword: e.target.value}))} placeholder="Current password" />
                </div>
                <div className="fg">
                  <label>New Password *</label>
                  <input required type={showPass ? 'text' : 'password'} value={passwords.newPassword}
                    onChange={e => setPasswords(p => ({...p, newPassword: e.target.value}))} placeholder="Min 8 chars, 1 upper, 1 number" />
                </div>
                <div className="fg">
                  <label>Confirm New Password *</label>
                  <input required type={showPass ? 'text' : 'password'} value={passwords.confirmPassword}
                    onChange={e => setPasswords(p => ({...p, confirmPassword: e.target.value}))} placeholder="Repeat new password" />
                </div>
                <div className="fg fg-full">
                  <label className="checkbox-label">
                    <input type="checkbox" checked={showPass} onChange={e => setShowPass(e.target.checked)} />
                    Show passwords
                  </label>
                </div>
              </div>
              <button type="submit" className="btn-primary-sm" disabled={passLoading} style={{ marginTop: '1rem' }}>
                {passLoading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
