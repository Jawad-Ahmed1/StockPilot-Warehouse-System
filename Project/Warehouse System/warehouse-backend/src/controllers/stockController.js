import pool from '../config/database.js';

// Get stock history (with optional filter by itemId)
export const getStockHistory = async (req, res) => {
  const { itemId, limit = 50, offset = 0 } = req.query;
  const connection = await pool.getConnection();
  try {
    let query = `
      SELECT sh.*, i.productName, i.sku
      FROM stock_history sh
      JOIN items i ON sh.itemId = i.id
    `;
    const params = [];
    if (itemId) {
      query += ' WHERE sh.itemId = ?';
      params.push(itemId);
    }
    query += ' ORDER BY sh.createdAt DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await connection.query(query, params);

    // total count
    let countQuery = 'SELECT COUNT(*) as total FROM stock_history';
    const countParams = [];
    if (itemId) {
      countQuery += ' WHERE itemId = ?';
      countParams.push(itemId);
    }
    const [countRows] = await connection.query(countQuery, countParams);

    res.json({ success: true, data: rows, total: countRows[0].total });
  } catch (err) {
    console.error('getStockHistory error:', err);
    res.status(500).json({ message: 'Failed to fetch stock history' });
  } finally {
    connection.release();
  }
};

// Log a stock movement (IN / OUT / ADJUSTMENT)
export const logStockMovement = async (req, res) => {
  const { itemId, transactionType, quantity, reason, notes } = req.body;

  if (!itemId || !transactionType || !quantity) {
    return res.status(400).json({ message: 'itemId, transactionType, and quantity are required' });
  }
  if (!['IN', 'OUT', 'ADJUSTMENT'].includes(transactionType)) {
    return res.status(400).json({ message: 'transactionType must be IN, OUT, or ADJUSTMENT' });
  }
  if (parseInt(quantity) <= 0) {
    return res.status(400).json({ message: 'quantity must be a positive number' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [items] = await connection.query('SELECT id, quantity FROM items WHERE id = ?', [itemId]);
    if (items.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Item not found' });
    }

    const previousQty = parseInt(items[0].quantity);
    const delta = parseInt(quantity);
    let newQty;

    if (transactionType === 'IN') {
      newQty = previousQty + delta;
    } else if (transactionType === 'OUT') {
      if (previousQty < delta) {
        await connection.rollback();
        return res.status(400).json({ message: `Insufficient stock. Available: ${previousQty}` });
      }
      newQty = previousQty - delta;
    } else {
      // ADJUSTMENT – set to the given value
      newQty = delta;
    }

    await connection.query('UPDATE items SET quantity = ?, updatedAt = NOW() WHERE id = ?', [newQty, itemId]);

    const [result] = await connection.query(
      `INSERT INTO stock_history (itemId, transactionType, quantity, previousQuantity, newQuantity, reason, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [itemId, transactionType, delta, previousQty, newQty, reason || null, notes || null]
    );

    await connection.commit();
    res.status(201).json({
      success: true,
      message: 'Stock movement logged',
      id: result.insertId,
      previousQuantity: previousQty,
      newQuantity: newQty,
    });
  } catch (err) {
    await connection.rollback();
    console.error('logStockMovement error:', err);
    res.status(500).json({ message: 'Failed to log stock movement' });
  } finally {
    connection.release();
  }
};
