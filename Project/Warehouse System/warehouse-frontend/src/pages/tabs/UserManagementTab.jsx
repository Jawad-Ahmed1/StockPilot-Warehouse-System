import React, { useState, useEffect } from 'react'
import { ShieldCheck, ToggleLeft, ToggleRight, AlertCircle } from 'lucide-react'
import { api } from '../../services/api'
import './TabShared.css'

const ROLE_COLORS = { admin: '#e74c3c', manager: '#8e44ad', supervisor: '#2980b9', staff: '#27ae60' }
const ROLES = ['staff', 'supervisor', 'manager', 'admin']

export default function UserManagementTab({ currentUser }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => { fetchUsers() }, [])

  const fetchUsers = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.get('/users')
      setUsers(data.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId, role) => {
    setError(''); setSuccess('')
    try {
      await api.patch(`/users/${userId}/role`, { role })
      setSuccess('Role updated successfully')
      setUsers(u => u.map(x => x.id === userId ? { ...x, role } : x))
    } catch (err) {
      setError(err.message)
    }
  }

  const handleToggleStatus = async (userId) => {
    setError(''); setSuccess('')
    try {
      const res = await api.patch(`/users/${userId}/status`)
      setSuccess(res.message)
      setUsers(u => u.map(x => x.id === userId ? { ...x, isActive: res.isActive } : x))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="tab-container">
      <div className="tab-header-row">
        <h3 className="tab-section-title">User Management</h3>
        <span className="count-badge">{users.length} users</span>
      </div>

      {error && <div className="tab-error"><AlertCircle size={16}/> {error}</div>}
      {success && <div className="tab-success">{success}</div>}

      {loading ? (
        <div className="tab-loading">Loading users...</div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Verified</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className={!u.isActive ? 'row-inactive' : ''}>
                  <td>
                    <div className="user-cell">
                      <div className="mini-avatar" style={{ background: ROLE_COLORS[u.role] }}>
                        {u.name?.charAt(0).toUpperCase()}
                      </div>
                      <strong>{u.name}</strong>
                      {u.id === currentUser?.id && <span className="you-badge">You</span>}
                    </div>
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>{u.email}</td>
                  <td style={{ fontSize: '0.85rem' }}>{u.phone || '—'}</td>
                  <td>
                    {u.id === currentUser?.id ? (
                      <span className="role-badge" style={{ background: ROLE_COLORS[u.role] }}>{u.role}</span>
                    ) : (
                      <select
                        value={u.role}
                        onChange={e => handleRoleChange(u.id, e.target.value)}
                        className="role-select"
                        style={{ borderColor: ROLE_COLORS[u.role] }}
                      >
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    )}
                  </td>
                  <td>
                    <span className={u.isVerified ? 'badge-green' : 'badge-gray'}>
                      {u.isVerified ? '✓ Verified' : 'Unverified'}
                    </span>
                  </td>
                  <td>
                    <span className={u.isActive ? 'badge-green' : 'badge-red'}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: '#888' }}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    {u.id !== currentUser?.id && (
                      <button
                        className={`icon-btn ${u.isActive ? 'delete' : 'edit'}`}
                        onClick={() => handleToggleStatus(u.id)}
                        title={u.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {u.isActive ? <ToggleRight size={18}/> : <ToggleLeft size={18}/>}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
