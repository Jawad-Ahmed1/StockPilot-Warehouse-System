import pool from '../config/database.js';

// Get all items
export const getAllItems = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [items] = await connection.query('SELECT * FROM items ORDER BY id DESC');
    connection.release();
    
    res.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
};

// Get single item by ID
export const getItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    const [items] = await connection.query('SELECT * FROM items WHERE id = ?', [id]);
    connection.release();
    
    if (items.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json(items[0]);
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
};

// Create new item
export const createItem = async (req, res) => {
  try {
    const { productName, sku, category, quantity, price, location, supplier, description } = req.body;

    // Validation
    if (!productName || !sku || !category || !quantity || !price || !location) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const connection = await pool.getConnection();
    
    // Check if SKU already exists
    const [existingItems] = await connection.query('SELECT id FROM items WHERE sku = ?', [sku]);
    if (existingItems.length > 0) {
      connection.release();
      return res.status(400).json({ error: 'SKU already exists' });
    }

    const query = `
      INSERT INTO items (productName, sku, category, quantity, price, location, supplier, description, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const [result] = await connection.query(query, [
      productName,
      sku,
      category,
      quantity,
      price,
      location,
      supplier || null,
      description || null
    ]);

    connection.release();

    res.status(201).json({
      id: result.insertId,
      productName,
      sku,
      category,
      quantity,
      price,
      location,
      supplier,
      description,
      message: 'Item created successfully'
    });
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
};

// Update item
export const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { productName, sku, category, quantity, price, location, supplier, description } = req.body;

    // Validation
    if (!productName || !sku || !category || !quantity || !price || !location) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const connection = await pool.getConnection();

    // Check if item exists
    const [existingItems] = await connection.query('SELECT id FROM items WHERE id = ?', [id]);
    if (existingItems.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Item not found' });
    }

    // Check if SKU is already used by another item
    const [skuCheck] = await connection.query('SELECT id FROM items WHERE sku = ? AND id != ?', [sku, id]);
    if (skuCheck.length > 0) {
      connection.release();
      return res.status(400).json({ error: 'SKU already exists' });
    }

    const query = `
      UPDATE items 
      SET productName = ?, sku = ?, category = ?, quantity = ?, price = ?, location = ?, supplier = ?, description = ?, updatedAt = NOW()
      WHERE id = ?
    `;

    await connection.query(query, [
      productName,
      sku,
      category,
      quantity,
      price,
      location,
      supplier || null,
      description || null,
      id
    ]);

    connection.release();

    res.json({
      id,
      productName,
      sku,
      category,
      quantity,
      price,
      location,
      supplier,
      description,
      message: 'Item updated successfully'
    });
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
};

// Delete item
export const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();

    // Check if item exists
    const [existingItems] = await connection.query('SELECT id FROM items WHERE id = ?', [id]);
    if (existingItems.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Item not found' });
    }

    await connection.query('DELETE FROM items WHERE id = ?', [id]);
    connection.release();

    res.json({ message: 'Item deleted successfully', id });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
};

// Search items by category or location
export const searchItems = async (req, res) => {
  try {
    const { category, location } = req.query;
    let query = 'SELECT * FROM items WHERE 1=1';
    const params = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (location) {
      query += ' AND location = ?';
      params.push(location);
    }

    query += ' ORDER BY id DESC';

    const connection = await pool.getConnection();
    const [items] = await connection.query(query, params);
    connection.release();

    res.json(items);
  } catch (error) {
    console.error('Error searching items:', error);
    res.status(500).json({ error: 'Failed to search items' });
  }
};
