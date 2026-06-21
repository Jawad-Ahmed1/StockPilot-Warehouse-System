import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Search, AlertCircle } from 'lucide-react'
import { api } from '../../services/api'
import './TabShared.css'

const CAN_ADD_EDIT  = ['admin', 'manager', 'supervisor']
const CAN_DELETE    = ['admin', 'manager']

export default function InventoryTab({ user }) {
  const role = user?.role || 'staff'
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [formData, setFormData] = useState({
    productName: '', sku: '', category: '', quantity: '',
    price: '', location: '', supplier: '', description: ''
  })

  const categories = ['Electronics', 'Office Supplies', 'Raw Materials', 'Packaging', 'Other']
  const locations  = ['Warehouse A', 'Warehouse B', 'Warehouse C', 'Storage Room']

  useEffect(() => { fetchItems() }, [])

  const fetchItems = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.get('/items')
      setItems(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (editingId) {
        await api.put(`/items/${editingId}`, formData)
      } else {
        await api.post('/items', formData)
      }
      fetchItems()
      resetForm()
      setShowModal(false)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleEdit = (item) => {
    setFormData({
      productName: item.productName, sku: item.sku,
      category: item.category, quantity: item.quantity,
      price: item.price, location: item.location,
      supplier: item.supplier || '', description: item.description || ''
    })
    setEditingId(item.id)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return
    try {
      await api.delete(`/items/${id}`)
      fetchItems()
    } catch (err) {
      setError(err.message)
    }
  }

  const resetForm = () => {
    setFormData({ productName: '', sku: '', category: '', quantity: '', price: '', location: '', supplier: '', description: '' })
    setEditingId(null)
  }

  const filtered = items.filter(item => {
    const s = searchTerm.toLowerCase()
    return (
      (item.productName.toLowerCase().includes(s) || item.sku.toLowerCase().includes(s)) &&
      (!filterCategory || item.category === filterCategory)
    )
  })

  const totalValue = items.reduce((s, i) => s + parseFloat(i.price || 0) * parseInt(i.quantity || 0), 0)

  return (
    <div className="tab-container">
      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card blue">
          <div className="stat-label">Total Items</div>
          <div className="stat-value">{items.length}</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-label">Total Units</div>
          <div className="stat-value">{items.reduce((s, i) => s + parseInt(i.quantity || 0), 0)}</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Inventory Value</div>
          <div className="stat-value">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-label">Categories</div>
          <div className="stat-value">{new Set(items.map(i => i.category)).size}</div>
        </div>
      </div>

      {error && <div className="tab-error"><AlertCircle size={16}/> {error}</div>}

      {/* Controls */}
      <div className="tab-controls">
        <div className="search-bar">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="filter-select">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {CAN_ADD_EDIT.includes(role) && (
          <button className="btn-primary-sm" onClick={() => { resetForm(); setShowModal(true) }}>
            <Plus size={16} /> Add Item
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="tab-loading">Loading inventory...</div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Location</th>
                <th>Supplier</th>
                {(CAN_ADD_EDIT.includes(role) || CAN_DELETE.includes(role)) && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map(item => (
                <tr key={item.id} className={item.quantity <= (item.thresholdQuantity || 10) ? 'row-low-stock' : ''}>
                  <td><strong>{item.productName}</strong></td>
                  <td><code>{item.sku}</code></td>
                  <td><span className="badge-cat">{item.category}</span></td>
                  <td>
                    <span className={item.quantity <= (item.thresholdQuantity || 10) ? 'qty-low' : 'qty-ok'}>
                      {item.quantity}
                    </span>
                  </td>
                  <td>${parseFloat(item.price).toFixed(2)}</td>
                  <td>{item.location}</td>
                  <td>{item.supplier || '—'}</td>
                  {(CAN_ADD_EDIT.includes(role) || CAN_DELETE.includes(role)) && (
                    <td className="actions-cell">
                      {CAN_ADD_EDIT.includes(role) && (
                        <button className="icon-btn edit" onClick={() => handleEdit(item)} title="Edit"><Edit2 size={15}/></button>
                      )}
                      {CAN_DELETE.includes(role) && (
                        <button className="icon-btn delete" onClick={() => handleDelete(item.id)} title="Delete"><Trash2 size={15}/></button>
                      )}
                    </td>
                  )}
                </tr>
              )) : (
                <tr><td colSpan="8" className="no-data-cell">No items found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h3>{editingId ? 'Edit Item' : 'Add New Item'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              {error && <div className="tab-error"><AlertCircle size={16}/> {error}</div>}
              <div className="form-grid">
                <div className="fg"><label>Product Name *</label>
                  <input required value={formData.productName} onChange={e => setFormData(p => ({...p, productName: e.target.value}))} placeholder="Product name" />
                </div>
                <div className="fg"><label>SKU *</label>
                  <input required value={formData.sku} onChange={e => setFormData(p => ({...p, sku: e.target.value}))} placeholder="SKU001" />
                </div>
                <div className="fg"><label>Category *</label>
                  <select required value={formData.category} onChange={e => setFormData(p => ({...p, category: e.target.value}))}>
                    <option value="">Select</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="fg"><label>Location *</label>
                  <select required value={formData.location} onChange={e => setFormData(p => ({...p, location: e.target.value}))}>
                    <option value="">Select</option>
                    {locations.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div className="fg"><label>Quantity *</label>
                  <input required type="number" min="0" value={formData.quantity} onChange={e => setFormData(p => ({...p, quantity: e.target.value}))} />
                </div>
                <div className="fg"><label>Price *</label>
                  <input required type="number" step="0.01" min="0" value={formData.price} onChange={e => setFormData(p => ({...p, price: e.target.value}))} />
                </div>
                <div className="fg"><label>Supplier</label>
                  <input value={formData.supplier} onChange={e => setFormData(p => ({...p, supplier: e.target.value}))} placeholder="Supplier name" />
                </div>
                <div className="fg fg-full"><label>Description</label>
                  <textarea rows="3" value={formData.description} onChange={e => setFormData(p => ({...p, description: e.target.value}))} placeholder="Optional description" />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary-sm" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary-sm">{editingId ? 'Update' : 'Add Item'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
