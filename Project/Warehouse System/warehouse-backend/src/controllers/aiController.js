import pool from '../config/database.js';

// Get fast-selling items with sales velocity metrics
export const getFastSellingItems = async (req, res) => {
  try {
    const connection = await pool.getConnection();

    // Get items with sales data from last 30 days
    const query = `
      SELECT 
        i.id,
        i.productName,
        i.sku,
        i.category,
        i.quantity,
        i.price,
        i.location,
        i.thresholdQuantity,
        COALESCE(SUM(st.quantitySold), 0) as totalSoldLast30Days,
        COALESCE(SUM(st.quantitySold) / 30, 0) as salesVelocityPerDay,
        COALESCE(SUM(st.totalSale), 0) as totalRevenueLast30Days,
        CASE 
          WHEN i.quantity <= i.thresholdQuantity THEN 'LOW'
          WHEN i.quantity <= i.thresholdQuantity * 1.5 THEN 'MEDIUM'
          ELSE 'GOOD'
        END as stockStatus,
        CASE 
          WHEN i.quantity > 0 THEN ROUND(i.quantity / (COALESCE(SUM(st.quantitySold) / 30, 1)), 1)
          ELSE 0
        END as daysUntilStockout
      FROM items i
      LEFT JOIN sales_transactions st ON i.id = st.itemId 
        AND st.saleDate >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY i.id
      HAVING COALESCE(SUM(st.quantitySold), 0) > 0
      ORDER BY salesVelocityPerDay DESC
    `;

    const [items] = await connection.query(query);
    connection.release();

    res.json({
      success: true,
      data: items,
      message: `Found ${items.length} fast-selling items`
    });
  } catch (error) {
    console.error('Error fetching fast-selling items:', error);
    res.status(500).json({ error: 'Failed to fetch fast-selling items' });
  }
};

// Get low stock alerts
export const getLowStockAlerts = async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const query = `
      SELECT 
        i.id,
        i.productName,
        i.sku,
        i.category,
        i.quantity,
        i.thresholdQuantity,
        i.price,
        i.location,
        (i.quantity * i.price) as stockValue,
        COALESCE(SUM(st.quantitySold) / 30, 0) as dailyConsumption,
        CASE 
          WHEN i.quantity = 0 THEN 'OUT_OF_STOCK'
          WHEN i.quantity <= i.thresholdQuantity THEN 'LOW'
          WHEN i.quantity <= i.thresholdQuantity * 1.5 THEN 'MEDIUM'
          ELSE 'GOOD'
        END as alertLevel,
        CASE
          WHEN COALESCE(SUM(st.quantitySold), 0) > 0 
            THEN ROUND(i.quantity / (COALESCE(SUM(st.quantitySold), 0) / 30), 0)
          ELSE 999
        END as daysUntilStockout
      FROM items i
      LEFT JOIN sales_transactions st ON i.id = st.itemId 
        AND st.saleDate >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      WHERE i.quantity <= i.thresholdQuantity * 1.5
      GROUP BY i.id
      ORDER BY 
        CASE 
          WHEN i.quantity = 0 THEN 1
          WHEN i.quantity <= i.thresholdQuantity THEN 2
          ELSE 3
        END,
        daysUntilStockout ASC
    `;

    const [alerts] = await connection.query(query);
    connection.release();

    res.json({
      success: true,
      data: alerts,
      message: `Found ${alerts.length} items needing attention`
    });
  } catch (error) {
    console.error('Error fetching low stock alerts:', error);
    res.status(500).json({ error: 'Failed to fetch low stock alerts' });
  }
};

// Get sales velocity metrics
export const getSalesVelocityMetrics = async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const query = `
      SELECT 
        i.id,
        i.productName,
        i.sku,
        i.category,
        i.price,
        COALESCE(SUM(st.quantitySold), 0) as totalSold30Days,
        COALESCE(SUM(st.quantitySold) / 30, 0) as unitsPerDay,
        COALESCE(SUM(st.quantitySold) / 30 * i.price, 0) as revenuePerDay,
        COALESCE(SUM(st.totalSale), 0) as totalRevenue30Days,
        CASE
          WHEN (COALESCE(SUM(st.quantitySold) / 30, 0)) > 5 THEN 'VERY_FAST'
          WHEN (COALESCE(SUM(st.quantitySold) / 30, 0)) > 2 THEN 'FAST'
          WHEN (COALESCE(SUM(st.quantitySold) / 30, 0)) > 0 THEN 'MODERATE'
          ELSE 'SLOW'
        END as velocityLevel,
        RANK() OVER (ORDER BY COALESCE(SUM(st.quantitySold), 0) DESC) as salesRank
      FROM items i
      LEFT JOIN sales_transactions st ON i.id = st.itemId 
        AND st.saleDate >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY i.id
      ORDER BY totalSold30Days DESC
    `;

    const [metrics] = await connection.query(query);
    connection.release();

    res.json({
      success: true,
      data: metrics,
      message: 'Sales velocity metrics retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching sales metrics:', error);
    res.status(500).json({ error: 'Failed to fetch sales metrics' });
  }
};

// Get AI insights summary
export const getAIInsightsSummary = async (req, res) => {
  try {
    const connection = await pool.getConnection();

    // Get critical metrics
    const [lowStockCount] = await connection.query(
      'SELECT COUNT(*) as count FROM items WHERE quantity <= thresholdQuantity'
    );

    const [fastMovingCount] = await connection.query(`
      SELECT COUNT(*) as count FROM (
        SELECT i.id FROM items i
        LEFT JOIN sales_transactions st ON i.id = st.itemId 
          AND st.saleDate >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        GROUP BY i.id
        HAVING COALESCE(SUM(st.quantitySold) / 30, 0) > 2
      ) as fast_items
    `);

    const [overStockedCount] = await connection.query(`
      SELECT COUNT(*) as count FROM items 
      WHERE quantity > thresholdQuantity * 3
    `);

    const [totalRevenue] = await connection.query(`
      SELECT COALESCE(SUM(totalSale), 0) as total 
      FROM sales_transactions 
      WHERE saleDate >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    `);

    const [topItem] = await connection.query(`
      SELECT 
        i.productName,
        COALESCE(SUM(st.quantitySold), 0) as totalSold,
        COALESCE(SUM(st.quantitySold) / 30, 0) as dailyRate
      FROM items i
      LEFT JOIN sales_transactions st ON i.id = st.itemId 
        AND st.saleDate >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY i.id
      ORDER BY totalSold DESC
      LIMIT 1
    `);

    connection.release();

    res.json({
      success: true,
      summary: {
        lowStockItems: lowStockCount[0].count,
        fastMovingItems: fastMovingCount[0].count,
        overstockedItems: overStockedCount[0].count,
        totalRevenue30Days: totalRevenue[0].total,
        topSellingItem: topItem[0]?.productName || 'N/A',
        topItemDailyRate: topItem[0]?.dailyRate || 0
      }
    });
  } catch (error) {
    console.error('Error fetching AI insights summary:', error);
    res.status(500).json({ error: 'Failed to fetch AI insights' });
  }
};

// Record a sale transaction (for future use)
export const recordSaleTransaction = async (req, res) => {
  try {
    const { itemId, quantitySold, totalSale } = req.body;

    if (!itemId || !quantitySold || totalSale === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const connection = await pool.getConnection();

    const query = `
      INSERT INTO sales_transactions (itemId, quantitySold, totalSale, saleDate)
      VALUES (?, ?, ?, CURDATE())
    `;

    await connection.query(query, [itemId, quantitySold, totalSale]);
    connection.release();

    res.status(201).json({
      success: true,
      message: 'Sale transaction recorded successfully'
    });
  } catch (error) {
    console.error('Error recording sale:', error);
    res.status(500).json({ error: 'Failed to record sale' });
  }
};
