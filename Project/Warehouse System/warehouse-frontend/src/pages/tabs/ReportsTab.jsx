import React, { useState } from 'react'
import { Download, FileText, Package, History, TrendingUp, AlertCircle } from 'lucide-react'
import { api } from '../../services/api'
import './TabShared.css'
import './ReportsTab.css'

// ── CSV helpers ──────────────────────────────────────────────────────────────

const toCSV = (rows, columns) => {
  const header = columns.map(c => `"${c.label}"`).join(',')
  const body   = rows.map(row =>
    columns.map(c => {
      const val = row[c.key] ?? ''
      return `"${String(val).replace(/"/g, '""')}"`
    }).join(',')
  ).join('\n')
  return `${header}\n${body}`
}

const downloadCSV = (csvContent, filename) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// ── Report configs ───────────────────────────────────────────────────────────

const REPORTS = [
  {
    id: 'inventory',
    title: 'Inventory Report',
    description: 'Full list of all items with stock levels, prices, locations and suppliers',
    icon: Package,
    color: '#667eea',
    fetchFn: () => api.get('/items'),
    transform: data => data,
    columns: [
      { key: 'id',           label: 'ID' },
      { key: 'productName',  label: 'Product Name' },
      { key: 'sku',          label: 'SKU' },
      { key: 'category',     label: 'Category' },
      { key: 'quantity',     label: 'Quantity' },
      { key: 'price',        label: 'Price ($)' },
      { key: 'location',     label: 'Location' },
      { key: 'supplier',     label: 'Supplier' },
      { key: 'thresholdQuantity', label: 'Min Threshold' },
      { key: 'createdAt',    label: 'Created At' },
    ],
    filename: 'inventory_report',
  },
  {
    id: 'low_stock',
    title: 'Low Stock Report',
    description: 'Items that are at or below their minimum threshold quantity',
    icon: AlertCircle,
    color: '#e74c3c',
    fetchFn: () => api.get('/ai/low-stock'),
    transform: data => data.data,
    columns: [
      { key: 'productName',      label: 'Product Name' },
      { key: 'sku',              label: 'SKU' },
      { key: 'category',         label: 'Category' },
      { key: 'quantity',         label: 'Current Stock' },
      { key: 'thresholdQuantity',label: 'Threshold' },
      { key: 'alertLevel',       label: 'Alert Level' },
      { key: 'location',         label: 'Location' },
      { key: 'dailyConsumption', label: 'Daily Usage' },
      { key: 'daysUntilStockout',label: 'Days Until Stockout' },
      { key: 'stockValue',       label: 'Stock Value ($)' },
    ],
    filename: 'low_stock_report',
  },
  {
    id: 'stock_history',
    title: 'Stock Movement Report',
    description: 'Complete log of all stock IN / OUT / ADJUSTMENT movements',
    icon: History,
    color: '#27ae60',
    fetchFn: () => api.get('/stock?limit=1000'),
    transform: data => data.data,
    columns: [
      { key: 'id',              label: 'ID' },
      { key: 'productName',     label: 'Product Name' },
      { key: 'sku',             label: 'SKU' },
      { key: 'transactionType', label: 'Type' },
      { key: 'quantity',        label: 'Quantity' },
      { key: 'previousQuantity',label: 'Before' },
      { key: 'newQuantity',     label: 'After' },
      { key: 'reason',          label: 'Reason' },
      { key: 'notes',           label: 'Notes' },
      { key: 'createdAt',       label: 'Date & Time' },
    ],
    filename: 'stock_movements_report',
  },
  {
    id: 'sales_velocity',
    title: 'Sales Velocity Report',
    description: 'Sales performance metrics and velocity data for all items (last 30 days)',
    icon: TrendingUp,
    color: '#f39c12',
    fetchFn: () => api.get('/ai/sales-velocity'),
    transform: data => data.data,
    columns: [
      { key: 'productName',       label: 'Product Name' },
      { key: 'sku',               label: 'SKU' },
      { key: 'category',          label: 'Category' },
      { key: 'totalSold30Days',   label: 'Units Sold (30d)' },
      { key: 'unitsPerDay',       label: 'Units/Day' },
      { key: 'revenuePerDay',     label: 'Revenue/Day ($)' },
      { key: 'totalRevenue30Days',label: 'Total Revenue (30d) ($)' },
      { key: 'velocityLevel',     label: 'Velocity Level' },
    ],
    filename: 'sales_velocity_report',
  },
]

// ── Component ────────────────────────────────────────────────────────────────

export default function ReportsTab({ user }) {
  const [loadingId, setLoadingId]   = useState(null)
  const [error, setError]           = useState('')
  const [lastExport, setLastExport] = useState({})

  const role = user?.role || 'staff'
  // Staff cannot export reports
  const canExport = ['admin', 'manager', 'supervisor'].includes(role)

  const handleExport = async (report) => {
    setError('')
    setLoadingId(report.id)
    try {
      const raw  = await report.fetchFn()
      const rows = report.transform(raw)
      if (!rows || rows.length === 0) {
        setError(`No data available for "${report.title}"`)
        return
      }
      const csv      = toCSV(rows, report.columns)
      const dateStr  = new Date().toISOString().slice(0, 10)
      downloadCSV(csv, `${report.filename}_${dateStr}.csv`)
      setLastExport(p => ({ ...p, [report.id]: new Date().toLocaleTimeString() }))
    } catch (err) {
      setError(err.message || 'Export failed')
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="tab-container">
      <div className="tab-header-row">
        <h3 className="tab-section-title">Reports & Export</h3>
        <span className="reports-hint">All exports are in CSV format — open with Excel or Google Sheets</span>
      </div>

      {error && <div className="tab-error"><AlertCircle size={15}/> {error}</div>}

      {!canExport ? (
        <div className="tab-error">
          <AlertCircle size={15}/> Your role does not have permission to export reports.
        </div>
      ) : (
        <div className="reports-grid">
          {REPORTS.map(report => {
            const Icon      = report.icon
            const isLoading = loadingId === report.id
            return (
              <div key={report.id} className="report-card" style={{ borderTopColor: report.color }}>
                <div className="report-card-header">
                  <div className="report-icon" style={{ background: report.color + '18', color: report.color }}>
                    <Icon size={24} />
                  </div>
                  <div className="report-meta">
                    <h4 className="report-title">{report.title}</h4>
                    <p className="report-desc">{report.description}</p>
                  </div>
                </div>

                <div className="report-card-footer">
                  {lastExport[report.id] && (
                    <span className="last-export">Last exported at {lastExport[report.id]}</span>
                  )}
                  <button
                    className="btn-primary-sm"
                    style={{ marginLeft: 'auto' }}
                    onClick={() => handleExport(report)}
                    disabled={isLoading}
                  >
                    {isLoading
                      ? <><span className="spin-sm">⏳</span> Exporting...</>
                      : <><Download size={15}/> Export CSV</>
                    }
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Info box */}
      <div className="reports-info">
        <FileText size={18} color="#667eea" />
        <div>
          <strong>How to use exported files</strong>
          <p>Open the downloaded <code>.csv</code> file directly in Microsoft Excel, Google Sheets, or any spreadsheet application. All data is exported with current values at the time of export.</p>
        </div>
      </div>
    </div>
  )
}
