import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import '../pages/AdminDashboard.css';

export default function AdminDashboard() {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    productName: '',
    sku: '',
    category: '',
    quantity: '',
    price: '',
    location: '',
    supplier: '',
    description: '',
  });

  const categories = ['Electronics', 'Office Supplies', 'Raw Materials', 'Packaging', 'Other'];
  const locations = ['Warehouse A', 'Warehouse B', 'Warehouse C', 'Storage Room'];

  // Fetch items on component mount
  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/items');
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = editingId 
        ? `http://localhost:5000/api/items/${editingId}`
        : 'http://localhost:5000/api/items';
      
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchItems();
        resetForm();
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      productName: item.productName,
      sku: item.sku,
      category: item.category,
      quantity: item.quantity,
      price: item.price,
      location: item.location,
      supplier: item.supplier,
      description: item.description,
    });
    setEditingId(item.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/items/${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          fetchItems();
        }
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      productName: '',
      sku: '',
      category: '',
      quantity: '',
      price: '',
      location: '',
      supplier: '',
      description: '',
    });
    setEditingId(null);
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !filterCategory || item.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard - Inventory Management</h1>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
          <Plus size={20} /> Add New Item
        </button>
      </div>

      <div className="dashboard-controls">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by product name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select 
          className="filter-select"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <div className="stats">
          <div className="stat-card">
            <h3>Total Items</h3>
            <p>{items.length}</p>
          </div>
          <div className="stat-card">
            <h3>Total Stock</h3>
            <p>{items.reduce((sum, item) => sum + parseInt(item.quantity || 0), 0)}</p>
          </div>
          <div className="stat-card">
            <h3>Categories</h3>
            <p>{new Set(items.map(item => item.category)).size}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="items-table-container">
          <table className="items-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Location</th>
                <th>Supplier</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length > 0 ? (
                filteredItems.map(item => (
                  <tr key={item.id}>
                    <td>{item.productName}</td>
                    <td>{item.sku}</td>
                    <td><span className="badge">{item.category}</span></td>
                    <td>{item.quantity}</td>
                    <td>${parseFloat(item.price).toFixed(2)}</td>
                    <td>{item.location}</td>
                    <td>{item.supplier}</td>
                    <td className="actions">
                      <button 
                        className="btn btn-edit"
                        onClick={() => handleEdit(item)}
                        title="Edit item"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        className="btn btn-delete"
                        onClick={() => handleDelete(item.id)}
                        title="Delete item"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="no-items">No items found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? 'Edit Item' : 'Add New Item'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="form">
              <div className="form-row">
                <div className="form-group">
                  <label>Product Name *</label>
                  <input
                    type="text"
                    name="productName"
                    value={formData.productName}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter product name"
                  />
                </div>
                <div className="form-group">
                  <label>SKU *</label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter SKU"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Location *</label>
                  <select
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Location</option>
                    {locations.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Quantity *</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter quantity"
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Price *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter price"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Supplier</label>
                  <input
                    type="text"
                    name="supplier"
                    value={formData.supplier}
                    onChange={handleInputChange}
                    placeholder="Enter supplier name"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter product description"
                  rows="4"
                ></textarea>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Update Item' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
