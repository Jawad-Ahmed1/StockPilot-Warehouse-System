import React, { useState, useEffect } from 'react'
import { AlertTriangle, TrendingUp, Zap, RefreshCw } from 'lucide-react'
import { api } from '../../services/api'
import './TabShared.css'

const BASE = 'http://localhost:5000/api'

const fetchRaw = async (path) => {
  const token = localStorage.getItem('authToken')
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return res.json()
}

export default function AIInsightsTab() {
  const [summary, setSummary]           = useState(null)
  const [fastSelling, setFastSelling]   = useState([])
  const [lowStock, setLowStock]         = useState([])
  const [salesVelocity, setSalesVelocity] = useState([])
  const [activeTab, setActiveTab]       = useState('alerts')
  const [loading, setLoading]           = useState(false)

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [s, f, l, v] = await Promise.all([
        fetchRaw('/ai/summary'),
        fetchRaw('/ai/fast-selling'),
        fetchRaw('/ai/low-stock'),
        fetchRaw('/ai/sales-velocity'),
      ])
      setSummary(s.summary)
      setFastSelling(f.data || [])
      setLowStock(l.data || [])
      setSalesVelocity(v.data || [])
    } catch {}
    setLoading(false)
  }

  const alertColor  = { OUT_OF_STOCK: '#e74c3c', LOW: '#f39c12', MEDIUM: '#f1c40f', GOOD: '#27ae60' }
  const velColor    = { VERY_FAST: '#e74c3c', FAST: '#f39c12', MODERATE: '#3498db', SLOW: '#95a5a6' }

  return (
    <div className="tab-container">
      {/* Summary strip */}
      {summary && (
        <div className="stats-row">
          <div className="stat-card red">
            <div className="stat-label">Low Stock</div>
            <div className="stat-value">{summary.lowStockItems}</div>
          </div>
          <div className="stat-card orange">
            <div className="stat-label">Fast Moving</div>
            <div className="stat-value">{summary.fastMovingItems}</div>
          </div>
          <div className="stat-card blue">
            <div className="stat-label">Overstocked</div>
            <div className="stat-value">{summary.overstockedItems}</div>
          </div>
          <div className="stat-card green">
            <div className="stat-label">Revenue (30d)</div>
            <div className="stat-value">${parseFloat(summary.totalRevenue30Days || 0).toLocaleString()}</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="inner-tabs">
        {[
          { key: 'alerts',   label: 'Low Stock Alerts', icon: AlertTriangle },
          { key: 'fast',     label: 'Fast Selling',     icon: TrendingUp },
          { key: 'velocity', label: 'Sales Velocity',   icon: Zap },
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} className={`inner-tab ${activeTab === key ? 'active' : ''}`} onClick={() => setActiveTab(key)}>
            <Icon size={16} /> {label}
          </button>
        ))}
        <button className="inner-tab refresh" onClick={loadAll} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'spin' : ''} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="tab-loading">Fetching AI data...</div>
      ) : (
        <div>
          {/* Low Stock */}
          {activeTab === 'alerts' && (
            lowStock.length === 0
              ? <div className="tab-empty">✅ All items are well stocked</div>
              : <div className="cards-grid">
                  {lowStock.map(item => (
                    <div key={item.id} className="alert-item-card" style={{ borderLeftColor: alertColor[item.alertLevel] }}>
                      <div className="aic-header">
                        <strong>{item.productName}</strong>
                        <span className="small-badge" style={{ background: alertColor[item.alertLevel] }}>{item.alertLevel}</span>
                      </div>
                      <div className="aic-body">
                        <span>SKU: {item.sku}</span>
                        <span>Stock: <b>{item.quantity}</b> / {item.thresholdQuantity}</span>
                        <span>Daily use: {parseFloat(item.dailyConsumption).toFixed(1)} units</span>
                        <span>Stockout in: <b style={{ color: item.daysUntilStockout < 7 ? '#e74c3c' : '#27ae60' }}>
                          {item.daysUntilStockout === 999 ? 'N/A' : `${item.daysUntilStockout}d`}
                        </b></span>
                      </div>
                    </div>
                  ))}
                </div>
          )}

          {/* Fast Selling */}
          {activeTab === 'fast' && (
            fastSelling.length === 0
              ? <div className="tab-empty">No sales data yet</div>
              : <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>#</th><th>Product</th><th>Units/Day</th>
                        <th>Sold (30d)</th><th>Revenue (30d)</th><th>Days to Stockout</th><th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fastSelling.map((item, i) => (
                        <tr key={item.id}>
                          <td><span className="rank-circle">{i + 1}</span></td>
                          <td><strong>{item.productName}</strong><br/><small>{item.sku}</small></td>
                          <td><strong>{parseFloat(item.salesVelocityPerDay).toFixed(2)}</strong></td>
                          <td>{item.totalSoldLast30Days}</td>
                          <td>${parseFloat(item.totalRevenueLast30Days).toFixed(2)}</td>
                          <td>{parseFloat(item.daysUntilStockout).toFixed(1)}d</td>
                          <td><span className={`small-badge ${item.stockStatus.toLowerCase()}-bg`}>{item.stockStatus}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
          )}

          {/* Sales Velocity */}
          {activeTab === 'velocity' && (
            salesVelocity.length === 0
              ? <div className="tab-empty">No sales data yet</div>
              : <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>#</th><th>Product</th><th>Category</th>
                        <th>Units/Day</th><th>Revenue/Day</th><th>Total Rev (30d)</th><th>Level</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesVelocity.map((item, i) => (
                        <tr key={item.id}>
                          <td><span className="rank-circle">{i + 1}</span></td>
                          <td><strong>{item.productName}</strong><br/><small>{item.sku}</small></td>
                          <td>{item.category}</td>
                          <td>{parseFloat(item.unitsPerDay).toFixed(2)}</td>
                          <td>${parseFloat(item.revenuePerDay).toFixed(2)}</td>
                          <td>${parseFloat(item.totalRevenue30Days).toFixed(2)}</td>
                          <td>
                            <span className="small-badge" style={{ background: velColor[item.velocityLevel] }}>
                              {item.velocityLevel}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
          )}
        </div>
      )}
    </div>
  )
}
