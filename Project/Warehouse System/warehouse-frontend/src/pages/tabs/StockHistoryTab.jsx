import React, { useState, useEffect } from 'react'
import { Plus, ArrowDownCircle, ArrowUpCircle, RefreshCw, AlertCircle } from 'lucide-react'
import { api } from '../../services/api'
import './TabShared.css'

export default function StockHistoryTab({ user }) {
  const [history, setHistory] = useState([])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ itemId: '', transactionType: 'IN', quantity: '', reason: '', notes: '' })
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchHistory()
    fetchItems()
  }, [])

  const fetchHistory = async () => {
    setLoading(true)
    try {
      const data = await api.get('/stock?limit=100')
      setHistory(data.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchItems = async () => {
    try {
      const data = await api.get('/items')
      setItems(data)
    } catch {}
  }

  const handleLog = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      await api.post('/stock', {
        ...formData,
        quantity: parseInt(formData.quantity)
      })
      setSuccess('Stock movement logged successfully')
      setShowModal(false)
      setFormData({ itemId: '', transactionType: 'IN', quantity: '', reason: '', notes: '' })
      fetchHistory()
    } catch (err) {
      setError(err.message)
    }
  }

  const typeIcon = (type) => {
    if (type === 'IN') return <ArrowDownCircle size={16} color="#27ae60" />
    if (type === 'OUT') return <ArrowUpCircle size={16} color="#e74c3c" />
    return <RefreshCw size={16} color="#f39c12" />
  }

  const typeColor = { IN: '#e8f5e9', OUT: '#ffebee', ADJUSTMENT: '#fff8e1' }
  const typeBadge = { IN: '#27ae60', OUT: '#e74c3c', ADJUSTMENT: '#f39c12' }

  return (
    <div className="tab-container">
      <div className="tab-header-row">
        <h3 className="tab-section-title">Stock Movement Log</h3>
        <button className="btn-primary-sm" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Log Movement
        </button>
      </div>

      {error && <div className="tab-error"><AlertCircle size={16}/> {error}</div>}
      {success && <div className="tab-success">{success}</div>}

      {loading ? (
        <div className="tab-loading">Loading history...</div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Product</th>
                <th>SKU</th>
                <th>Type</th>
                <th>Qty</th>
                <th>Before → After</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {history.length > 0 ? history.map(row => (
                <tr key={row.id} style={{ background: typeColor[row.transactionType] + '55' }}>
                  <td style={{ whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                    {new Date(row.createdAt).toLocaleString()}
                  </td>
                  <td><strong>{row.productName}</strong></td>
                  <td><code>{row.sku}</code></td>
                  <td>
                    <span className="type-badge" style={{ background: typeBadge[row.transactionType] }}>
                      {typeIcon(row.transactionType)} {row.transactionType}
                    </span>
                  </td>
                  <td><strong>{row.quantity}</strong></td>
                  <td>
                    <span className="qty-flow">
                      {row.previousQuantity} → <strong>{row.newQuantity}</strong>
                    </span>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: '#555' }}>{row.reason || '—'}</td>
                </tr>
              )) : (
                <tr><td colSpan="7" className="no-data-cell">No stock movements yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Log Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Log Stock Movement</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleLog} className="modal-body">
              {error && <div className="tab-error"><AlertCircle size={16}/> {error}</div>}
              <div className="form-grid">
                <div className="fg fg-full">
                  <label>Item *</label>
                  <select required value={formData.itemId} onChange={e => setFormData(p => ({...p, itemId: e.target.value}))}>
                    <option value="">Select item</option>
                    {items.map(i => (
                      <option key={i.id} value={i.id}>{i.productName} ({i.sku}) — Stock: {i.quantity}</option>
                    ))}
                  </select>
                </div>
                <div className="fg">
                  <label>Transaction Type *</label>
                  <select value={formData.transactionType} onChange={e => setFormData(p => ({...p, transactionType: e.target.value}))}>
                    <option value="IN">IN — Receive Stock</option>
                    <option value="OUT">OUT — Dispatch Stock</option>
                    <option value="ADJUSTMENT">ADJUSTMENT — Set Quantity</option>
                  </select>
                </div>
                <div className="fg">
                  <label>Quantity *</label>
                  <input required type="number" min="1" value={formData.quantity}
                    onChange={e => setFormData(p => ({...p, quantity: e.target.value}))}
                    placeholder={formData.transactionType === 'ADJUSTMENT' ? 'New total quantity' : 'Units to add/remove'}
                  />
                </div>
                <div className="fg fg-full">
                  <label>Reason</label>
                  <input value={formData.reason} onChange={e => setFormData(p => ({...p, reason: e.target.value}))} placeholder="e.g. Purchase order #123, Damaged goods..." />
                </div>
                <div className="fg fg-full">
                  <label>Notes</label>
                  <textarea rows="2" value={formData.notes} onChange={e => setFormData(p => ({...p, notes: e.target.value}))} placeholder="Optional additional notes" />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary-sm" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary-sm">Log Movement</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
