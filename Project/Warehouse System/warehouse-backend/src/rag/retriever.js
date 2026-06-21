/**
 * RAG Retriever — fetches relevant warehouse context from MySQL
 * based on the user's role and their question.
 *
 * Role access matrix:
 *   staff      → own-item stock levels only
 *   supervisor → all items + stock history
 *   manager    → all items + stock history + sales + AI metrics
 *   admin      → everything above + user list
 */

import pool from '../config/database.js';

// ── helpers ────────────────────────────────────────────────────────────────

const fmt = (rows) => JSON.stringify(rows, null, 2);

const query = async (sql, params = []) => {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query(sql, params);
    return rows;
  } finally {
    conn.release();
  }
};

// ── per-role data retrieval ────────────────────────────────────────────────

/** Staff: only current stock levels */
const getStaffContext = async () => {
  const items = await query(
    'SELECT productName, sku, category, quantity, thresholdQuantity, location FROM items ORDER BY productName'
  );
  return `## Current Inventory (Stock Levels)\n${fmt(items)}`;
};

/** Supervisor: items + recent movements */
const getSupervisorContext = async () => {
  const items = await query(
    'SELECT productName, sku, category, quantity, thresholdQuantity, price, location, supplier FROM items ORDER BY productName'
  );
  const movements = await query(`
    SELECT sh.transactionType, sh.quantity, sh.previousQuantity, sh.newQuantity,
           sh.reason, sh.createdAt, i.productName, i.sku
    FROM stock_history sh JOIN items i ON sh.itemId = i.id
    ORDER BY sh.createdAt DESC LIMIT 30
  `);
  return [
    `## Inventory\n${fmt(items)}`,
    `## Recent Stock Movements (last 30)\n${fmt(movements)}`,
  ].join('\n\n');
};

/** Manager: items + movements + sales + low stock + velocity */
const getManagerContext = async () => {
  const base = await getSupervisorContext();

  const lowStock = await query(`
    SELECT productName, sku, quantity, thresholdQuantity, location,
      CASE WHEN quantity=0 THEN 'OUT_OF_STOCK'
           WHEN quantity<=thresholdQuantity THEN 'LOW' ELSE 'MEDIUM' END AS alertLevel
    FROM items WHERE quantity <= thresholdQuantity * 1.5
    ORDER BY quantity ASC
  `);

  const sales = await query(`
    SELECT i.productName, i.sku, i.category,
      SUM(st.quantitySold) AS totalSold30d,
      ROUND(SUM(st.quantitySold)/30, 2) AS unitsPerDay,
      ROUND(SUM(st.totalSale), 2) AS revenue30d
    FROM items i
    LEFT JOIN sales_transactions st ON i.id=st.itemId
      AND st.saleDate >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    GROUP BY i.id ORDER BY totalSold30d DESC
  `);

  const revenue = await query(`
    SELECT ROUND(SUM(totalSale),2) AS total30d,
           ROUND(SUM(totalSale)/30,2) AS avgPerDay
    FROM sales_transactions
    WHERE saleDate >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
  `);

  return [
    base,
    `## Low Stock Alerts\n${fmt(lowStock)}`,
    `## Sales Performance (last 30 days)\n${fmt(sales)}`,
    `## Revenue Summary\n${fmt(revenue)}`,
  ].join('\n\n');
};

/** Admin: everything + users */
const getAdminContext = async () => {
  const base = await getManagerContext();

  const users = await query(
    'SELECT id, name, email, role, isVerified, isActive, createdAt FROM users ORDER BY createdAt DESC'
  );

  const stockSummary = await query(`
    SELECT transactionType, COUNT(*) AS count, SUM(quantity) AS totalUnits
    FROM stock_history
    WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    GROUP BY transactionType
  `);

  return [
    base,
    `## System Users\n${fmt(users)}`,
    `## Stock Movement Summary (last 7 days)\n${fmt(stockSummary)}`,
  ].join('\n\n');
};

// ── main export ────────────────────────────────────────────────────────────

export const retrieveContext = async (role) => {
  switch (role) {
    case 'admin':      return getAdminContext();
    case 'manager':    return getManagerContext();
    case 'supervisor': return getSupervisorContext();
    case 'staff':
    default:           return getStaffContext();
  }
};

/** Role-based system prompt — tells Gemini what the user can ask about */
export const getSystemPrompt = (role, userName) => {
  const roleRules = {
    staff: `You are a warehouse assistant for ${userName} (Staff).
You can ONLY answer questions about current stock levels and item locations.
Do NOT reveal pricing, supplier details, sales data, user information, or revenue.
If asked about anything outside stock levels, politely say it is outside your access.`,

    supervisor: `You are a warehouse assistant for ${userName} (Supervisor).
You can answer questions about inventory levels, item details, stock movements, and warehouse locations.
Do NOT reveal sales revenue, financial data, or user account information.
If asked about restricted data, politely say it is outside your access.`,

    manager: `You are a warehouse assistant for ${userName} (Manager).
You can answer questions about inventory, stock movements, sales performance, revenue, low stock alerts, and AI insights.
Do NOT reveal user account details or system configuration.
If asked about restricted data, politely say it is outside your access.`,

    admin: `You are a warehouse assistant for ${userName} (Admin).
You have full access — inventory, stock movements, sales, revenue, user accounts, and system activity.
Answer all questions accurately and helpfully using the provided warehouse data.`,
  };

  return (roleRules[role] || roleRules.staff) + `

IMPORTANT RULES:
- Always base answers on the provided warehouse data below.
- Be concise and specific. Use numbers from the data.
- Format responses clearly — use bullet points or tables where helpful.
- If data is not in the context, say "I don't have that data available."
- Never make up numbers or invent data.`;
};
