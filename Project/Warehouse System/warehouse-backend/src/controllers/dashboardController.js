import pool from '../config/database.js';

export const getDashboardStats = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    // KPI counts
    const [[{ totalItems }]]        = await connection.query('SELECT COUNT(*) AS totalItems FROM items');
    const [[{ totalStock }]]        = await connection.query('SELECT COALESCE(SUM(quantity),0) AS totalStock FROM items');
    const [[{ inventoryValue }]]    = await connection.query('SELECT COALESCE(SUM(quantity*price),0) AS inventoryValue FROM items');
    const [[{ lowStockCount }]]     = await connection.query('SELECT COUNT(*) AS lowStockCount FROM items WHERE quantity <= thresholdQuantity');
    const [[{ totalUsers }]]        = await connection.query('SELECT COUNT(*) AS totalUsers FROM users WHERE isActive=TRUE');
    const [[{ revenue30 }]]         = await connection.query(
      'SELECT COALESCE(SUM(totalSale),0) AS revenue30 FROM sales_transactions WHERE saleDate >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)'
    );
    const [[{ stockMovements7 }]]   = await connection.query(
      'SELECT COUNT(*) AS stockMovements7 FROM stock_history WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)'
    );

    // Stock by category (pie chart)
    const [byCategory] = await connection.query(
      'SELECT category AS name, SUM(quantity) AS value FROM items GROUP BY category ORDER BY value DESC'
    );

    // Inventory value by category (bar chart)
    const [valueByCategory] = await connection.query(
      'SELECT category AS name, ROUND(SUM(quantity*price),2) AS value FROM items GROUP BY category ORDER BY value DESC'
    );

    // Stock movements last 7 days (line chart)
    const [movementTrend] = await connection.query(`
      SELECT
        DATE_FORMAT(DATE(createdAt), '%b %d') AS day,
        DATE(createdAt) AS rawDay,
        SUM(CASE WHEN transactionType='IN'  THEN quantity ELSE 0 END) AS stockIn,
        SUM(CASE WHEN transactionType='OUT' THEN quantity ELSE 0 END) AS stockOut
      FROM stock_history
      WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(createdAt), DATE_FORMAT(DATE(createdAt), '%b %d')
      ORDER BY DATE(createdAt) ASC
    `);

    // Revenue last 7 days (area chart)
    const [revenueTrend] = await connection.query(`
      SELECT DATE_FORMAT(saleDate,'%b %d') AS day, ROUND(SUM(totalSale),2) AS revenue
      FROM sales_transactions
      WHERE saleDate >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY saleDate ORDER BY saleDate ASC
    `);

    // Top 5 low stock items
    const [lowStockItems] = await connection.query(
      'SELECT productName, sku, quantity, thresholdQuantity, location FROM items WHERE quantity <= thresholdQuantity ORDER BY quantity ASC LIMIT 5'
    );

    // Recent 8 stock movements
    const [recentMovements] = await connection.query(`
      SELECT sh.transactionType, sh.quantity, sh.reason, sh.createdAt,
             i.productName, i.sku
      FROM stock_history sh
      JOIN items i ON sh.itemId = i.id
      ORDER BY sh.createdAt DESC LIMIT 8
    `);

    res.json({
      success: true,
      kpis: { totalItems, totalStock, inventoryValue, lowStockCount, totalUsers, revenue30, stockMovements7 },
      charts: { byCategory, valueByCategory, movementTrend, revenueTrend },
      lowStockItems,
      recentMovements,
    });
  } catch (err) {
    console.error('getDashboardStats error:', err);
    res.status(500).json({ message: 'Failed to load dashboard stats' });
  } finally {
    connection.release();
  }
};

// Notifications — low stock + recent movements
export const getNotifications = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const [lowStock] = await connection.query(`
      SELECT id, productName, sku, quantity, thresholdQuantity,
        CASE WHEN quantity=0 THEN 'critical' WHEN quantity <= thresholdQuantity THEN 'warning' ELSE 'info' END AS severity
      FROM items WHERE quantity <= thresholdQuantity ORDER BY quantity ASC LIMIT 20
    `);

    const [movements] = await connection.query(`
      SELECT sh.id, sh.transactionType, sh.quantity, sh.reason, sh.createdAt,
             i.productName
      FROM stock_history sh JOIN items i ON sh.itemId=i.id
      ORDER BY sh.createdAt DESC LIMIT 15
    `);

    const notifications = [
      ...lowStock.map(i => ({
        id: `ls-${i.id}`,
        type: 'low_stock',
        severity: i.severity,
        title: i.quantity === 0 ? 'Out of Stock' : 'Low Stock Alert',
        message: `${i.productName} — ${i.quantity} units left (threshold: ${i.thresholdQuantity})`,
        time: null,
      })),
      ...movements.map(m => ({
        id: `mv-${m.id}`,
        type: 'movement',
        severity: 'info',
        title: `Stock ${m.transactionType}`,
        message: `${m.productName}: ${m.transactionType} ${m.quantity} units${m.reason ? ' — ' + m.reason : ''}`,
        time: m.createdAt,
      })),
    ];

    res.json({ success: true, notifications, unreadCount: lowStock.length });
  } catch (err) {
    console.error('getNotifications error:', err);
    res.status(500).json({ message: 'Failed to load notifications' });
  } finally {
    connection.release();
  }
};
