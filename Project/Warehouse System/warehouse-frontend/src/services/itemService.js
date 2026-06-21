import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Item API calls
export const itemService = {
  // Get all items
  getAllItems: () => apiClient.get('/items'),

  // Get single item
  getItem: (id) => apiClient.get(`/items/${id}`),

  // Create item
  createItem: (itemData) => apiClient.post('/items', itemData),

  // Update item
  updateItem: (id, itemData) => apiClient.put(`/items/${id}`, itemData),

  // Delete item
  deleteItem: (id) => apiClient.delete(`/items/${id}`),

  // Search items
  searchItems: (filters) => apiClient.get('/items/search', { params: filters }),
};

// Health check
export const healthCheck = () => apiClient.get('/health');

export default apiClient;
