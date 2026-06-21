import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, Package, Zap, Eye } from 'lucide-react';
import '../pages/AIInsights.css';

export default function AIInsights() {
  const [summary, setSummary] = useState(null);
  const [fastSelling, setFastSelling] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [salesVelocity, setSalesVelocity] = useState([]);
  const [activeTab, setActiveTab] = useState('summary');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAllData();
    // Refresh every 5 minutes
    const interval = setInterval(fetchAllData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchSummary(),
        fetchFastSelling(),
        fetchLowStock(),
        fetchSalesVelocity()
      ]);
    } catch (error) {
      console.error('Error fetching AI data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/ai/summary');
      const data = await response.json();
      setSummary(data.summary);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const fetchFastSelling = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/ai/fast-selling');
      const data = await response.json();
      setFastSelling(data.data);
    } catch (error) {
      console.error('Error fetching fast-selling items:', error);
    }
  };

  const fetchLowStock = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/ai/low-stock');
      const data = await response.json();
      setLowStock(data.data);
    } catch (error) {
      console.error('Error fetching low stock:', error);
    }
  };

  const fetchSalesVelocity = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/ai/sales-velocity');
      const data = await response.json();
      setSalesVelocity(data.data);
    } catch (error) {
      console.error('Error fetching sales velocity:', error);
    }
  };

  const getAlertColor = (level) => {
    switch(level) {
      case 'OUT_OF_STOCK': return '#e74c3c';
      case 'LOW': return '#f39c12';
      case 'MEDIUM': return '#f1c40f';
      case 'GOOD': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  const getVelocityColor = (level) => {
    switch(level) {
      case 'VERY_FAST': return '#e74c3c';
      case 'FAST': return '#f39c12';
      case 'MODERATE': return '#f1c40f';
      case 'SLOW': return '#95a5a6';
      default: return '#95a5a6';
    }
  };

  return (
    <div className="ai-insights">
      <div className="insights-header">
        <h1>🤖 AI Insights & Analytics</h1>
        <button className="refresh-btn" onClick={fetchAllData} disabled={loading}>
          🔄 Refresh
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="summary-grid">
          <div className="summary-card alert">
            <div className="card-icon">🔴</div>
            <div className="card-content">
              <h3>Low Stock Items</h3>
              <p className="card-value">{summary.lowStockItems}</p>
              <span className="card-label">Require Attention</span>
            </div>
          </div>

          <div className="summary-card success">
            <div className="card-icon">⚡</div>
            <div className="card-content">
              <h3>Fast-Moving Items</h3>
              <p className="card-value">{summary.fastMovingItems}</p>
              <span className="card-label">High Sales Velocity</span>
            </div>
          </div>

          <div className="summary-card info">
            <div className="card-icon">📦</div>
            <div className="card-content">
              <h3>Overstocked Items</h3>
              <p className="card-value">{summary.overstockedItems}</p>
              <span className="card-label">Excess Inventory</span>
            </div>
          </div>

          <div className="summary-card revenue">
            <div className="card-icon">💰</div>
            <div className="card-content">
              <h3>Revenue (30 Days)</h3>
              <p className="card-value">${parseFloat(summary.totalRevenue30Days).toFixed(2)}</p>
              <span className="card-label">Total Sales</span>
            </div>
          </div>

          {summary.topSellingItem && (
            <div className="summary-card top">
              <div className="card-icon">🏆</div>
              <div className="card-content">
                <h3>Top Selling Item</h3>
                <p className="card-value">{summary.topSellingItem}</p>
                <span className="card-label">{summary.topItemDailyRate.toFixed(2)} units/day</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="tabs-container">
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'summary' ? 'active' : ''}`}
            onClick={() => setActiveTab('summary')}
          >
            <AlertTriangle size={18} /> Low Stock Alerts
          </button>
          <button 
            className={`tab ${activeTab === 'fastSelling' ? 'active' : ''}`}
            onClick={() => setActiveTab('fastSelling')}
          >
            <TrendingUp size={18} /> Fast-Selling Items
          </button>
          <button 
            className={`tab ${activeTab === 'velocity' ? 'active' : ''}`}
            onClick={() => setActiveTab('velocity')}
          >
            <Zap size={18} /> Sales Velocity
          </button>
        </div>

        {loading ? (
          <div className="loading">Fetching AI insights...</div>
        ) : (
          <div className="tab-content">
            {/* Low Stock Alerts Tab */}
            {activeTab === 'summary' && (
              <div className="alert-section">
                <h2>⚠️ Low Stock Alerts</h2>
                {lowStock.length > 0 ? (
                  <div className="alerts-grid">
                    {lowStock.map(item => (
                      <div 
                        key={item.id} 
                        className="alert-card"
                        style={{ borderLeftColor: getAlertColor(item.alertLevel) }}
                      >
                        <div className="alert-header">
                          <h3>{item.productName}</h3>
                          <span 
                            className="alert-badge"
                            style={{ backgroundColor: getAlertColor(item.alertLevel) }}
                          >
                            {item.alertLevel}
                          </span>
                        </div>
                        <div className="alert-details">
                          <p><strong>SKU:</strong> {item.sku}</p>
                          <p><strong>Current Stock:</strong> {item.quantity} / {item.thresholdQuantity}</p>
                          <p><strong>Daily Consumption:</strong> {item.dailyConsumption.toFixed(2)} units</p>
                          <p><strong>Days Until Stockout:</strong> 
                            <span style={{ color: item.daysUntilStockout < 7 ? '#e74c3c' : '#27ae60' }}>
                              {item.daysUntilStockout === 999 ? 'N/A' : `${item.daysUntilStockout} days`}
                            </span>
                          </p>
                          <p><strong>Location:</strong> {item.location}</p>
                          <p><strong>Stock Value:</strong> ${parseFloat(item.stockValue).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-data">✅ No low stock items. Everything looks good!</div>
                )}
              </div>
            )}

            {/* Fast-Selling Items Tab */}
            {activeTab === 'fastSelling' && (
              <div className="fast-selling-section">
                <h2>🚀 Fast-Selling Items</h2>
                {fastSelling.length > 0 ? (
                  <div className="fast-selling-list">
                    {fastSelling.map((item, index) => (
                      <div key={item.id} className="fast-item-card">
                        <div className="rank-badge">#{index + 1}</div>
                        <div className="item-info">
                          <h3>{item.productName}</h3>
                          <p className="sku">{item.sku}</p>
                        </div>
                        <div className="metrics">
                          <div className="metric">
                            <span className="label">Sales Velocity</span>
                            <span className="value">{item.salesVelocityPerDay.toFixed(2)}</span>
                            <span className="unit">units/day</span>
                          </div>
                          <div className="metric">
                            <span className="label">Total Sold (30d)</span>
                            <span className="value">{item.totalSoldLast30Days}</span>
                            <span className="unit">units</span>
                          </div>
                          <div className="metric">
                            <span className="label">Revenue (30d)</span>
                            <span className="value">${parseFloat(item.totalRevenueLast30Days).toFixed(0)}</span>
                          </div>
                          <div className="metric">
                            <span className="label">Days to Stockout</span>
                            <span className="value">{item.daysUntilStockout.toFixed(1)}</span>
                            <span className="unit">days</span>
                          </div>
                        </div>
                        <div className="stock-status">
                          <span 
                            className={`status-badge ${item.stockStatus.toLowerCase()}`}
                          >
                            {item.stockStatus} ({item.quantity} units)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-data">No sales data available yet</div>
                )}
              </div>
            )}

            {/* Sales Velocity Tab */}
            {activeTab === 'velocity' && (
              <div className="velocity-section">
                <h2>📊 Sales Velocity Metrics</h2>
                {salesVelocity.length > 0 ? (
                  <div className="velocity-table-container">
                    <table className="velocity-table">
                      <thead>
                        <tr>
                          <th>Rank</th>
                          <th>Product Name</th>
                          <th>Category</th>
                          <th>Units/Day</th>
                          <th>Revenue/Day</th>
                          <th>Total Revenue (30d)</th>
                          <th>Velocity Level</th>
                        </tr>
                      </thead>
                      <tbody>
                        {salesVelocity.map((item, index) => (
                          <tr key={item.id}>
                            <td>
                              <span className="rank">{index + 1}</span>
                            </td>
                            <td>
                              <strong>{item.productName}</strong>
                              <br/>
                              <small>{item.sku}</small>
                            </td>
                            <td>{item.category}</td>
                            <td className="metric-cell">
                              {item.unitsPerDay.toFixed(2)}
                            </td>
                            <td className="metric-cell">
                              ${item.revenuePerDay.toFixed(2)}
                            </td>
                            <td className="metric-cell">
                              ${parseFloat(item.totalRevenue30Days).toFixed(2)}
                            </td>
                            <td>
                              <span 
                                className="velocity-badge"
                                style={{ backgroundColor: getVelocityColor(item.velocityLevel) }}
                              >
                                {item.velocityLevel}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="no-data">No sales data available yet</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
