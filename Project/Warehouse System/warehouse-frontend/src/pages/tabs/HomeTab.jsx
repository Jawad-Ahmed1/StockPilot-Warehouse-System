import React, { useState, useEffect } from 'react'
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { Package, TrendingUp, AlertTriangle, DollarSign, Users, Activity } from 'lucide-react'
import { api } from '../../services/api'
import './TabShared.css'
import './HomeTab.css'

const COLORS = ['#667eea', '#e74c3c', '#27ae60', '#f39c12', '#9b59b6', '#1abc9c']

const KPICard = ({ icon: Icon, label, value, color, sub }) => (
  <div className="kpi-card" style={{ borderLeftColor: color }}>
    <div className="kpi-icon" style={{ background: color + '18', color }}><Icon size={22} /></div>
    <div className="kpi-body">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      {sub && <div className="kpi-sub">{sub}</div>}
    </div>
  </div>
)

export default function HomeTab({ user }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/dashboard/stats')
      setData(res)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="tab-loading">Loading dashboard...</div>
  if (error)   return <div className="tab-error">{error}</div>
  if (!data)   return null

  const { kpis, charts, lowStockItems, recentMovements } = data

  return (
    <div className="home-tab">
      {/* KPI Row */}
      <div className="kpi-row">
        <KPICard icon={Package}      label="Total Items"       value={kpis.totalItems}   color="#667eea" />
        <KPICard icon={Activity}     label="Total Stock Units" value={kpis.totalStock?.toLocaleString()} color="#27ae60" />
        <KPICard icon={DollarSign}   label="Inventory Value"   value={`$${Number(kpis.inventoryValue).toLocaleString('en',{minimumFractionDigits:2,maximumFractionDigits:2})}`} color="#8e44ad" />
        <KPICard icon={AlertTriangle} label="Low Stock Items"  value={kpis.lowStockCount} color="#e74c3c" sub="Need attention" />
        <KPICard icon={TrendingUp}   label="Revenue (30d)"     value={`$${Number(kpis.revenue30).toLocaleString('en',{minimumFractionDigits:2,maximumFractionDigits:2})}`} color="#f39c12" />
        <KPICard icon={Users}        label="Active Users"      value={kpis.totalUsers}   color="#1abc9c" />
      </div>

      {/* Charts Row 1 */}
      <div className="charts-row">
        {/* Stock by Category — Pie */}
        <div className="chart-card">
          <h4 className="chart-title">Stock by Category</h4>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={charts.byCategory} dataKey="value" nameKey="name"
                cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}
                labelLine={false}>
                {charts.byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={v => [`${v} units`, 'Stock']} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Inventory Value by Category — Bar */}
        <div className="chart-card chart-wide">
          <h4 className="chart-title">Inventory Value by Category</h4>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={charts.valueByCategory} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={v => [`$${Number(v).toLocaleString()}`, 'Value']} />
              <Bar dataKey="value" radius={[4,4,0,0]}>
                {charts.valueByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="charts-row">
        {/* Stock Movement trend — Line */}
        <div className="chart-card chart-wide">
          <h4 className="chart-title">Stock Movements — Last 7 Days</h4>
          {charts.movementTrend.length === 0 ? (
            <div className="chart-empty">No stock movements in the last 7 days</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={charts.movementTrend} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="stockIn"  stroke="#27ae60" strokeWidth={2} dot={{ r: 4 }} name="Stock IN" />
                <Line type="monotone" dataKey="stockOut" stroke="#e74c3c" strokeWidth={2} dot={{ r: 4 }} name="Stock OUT" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Revenue trend — Area */}
        <div className="chart-card">
          <h4 className="chart-title">Revenue — Last 7 Days</h4>
          {charts.revenueTrend.length === 0 ? (
            <div className="chart-empty">No sales data in the last 7 days</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={charts.revenueTrend} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#667eea" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#667eea" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `$${v}`} />
                <Tooltip formatter={v => [`$${Number(v).toLocaleString()}`, 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#667eea" strokeWidth={2} fill="url(#revGrad)" name="Revenue" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="bottom-row">
        {/* Low stock items */}
        <div className="list-card">
          <h4 className="chart-title">⚠️ Low Stock Items</h4>
          {lowStockItems.length === 0 ? (
            <div className="chart-empty">✅ All items well stocked</div>
          ) : (
            <table className="mini-table">
              <thead><tr><th>Product</th><th>SKU</th><th>Qty</th><th>Threshold</th><th>Location</th></tr></thead>
              <tbody>
                {lowStockItems.map((item, i) => (
                  <tr key={i}>
                    <td><strong>{item.productName}</strong></td>
                    <td><code>{item.sku}</code></td>
                    <td><span className={item.quantity === 0 ? 'qty-zero' : 'qty-low'}>{item.quantity}</span></td>
                    <td>{item.thresholdQuantity}</td>
                    <td>{item.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Recent movements */}
        <div className="list-card">
          <h4 className="chart-title">🕒 Recent Stock Movements</h4>
          {recentMovements.length === 0 ? (
            <div className="chart-empty">No movements yet</div>
          ) : (
            <div className="movement-list">
              {recentMovements.map((m, i) => (
                <div key={i} className="movement-row">
                  <span className={`move-type move-${m.transactionType.toLowerCase()}`}>{m.transactionType}</span>
                  <div className="move-info">
                    <span className="move-name">{m.productName}</span>
                    <span className="move-detail">{m.quantity} units{m.reason ? ` — ${m.reason}` : ''}</span>
                  </div>
                  <span className="move-time">{new Date(m.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
