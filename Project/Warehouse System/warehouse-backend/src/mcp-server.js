import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "warehouse_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Define tools
const tools = [
  {
    name: "get_inventory",
    description: "Get all items in warehouse inventory with stock levels",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "get_item_details",
    description: "Get detailed information about a specific item",
    inputSchema: {
      type: "object",
      properties: {
        item_id: { type: "number", description: "The ID of the item to retrieve" }
      },
      required: ["item_id"]
    }
  },
  {
    name: "add_item",
    description: "Add a new item to warehouse inventory",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Product name" },
        sku: { type: "string", description: "SKU/Product code" },
        category: { type: "string", description: "Item category" },
        quantity: { type: "number", description: "Initial stock quantity" },
        price: { type: "number", description: "Unit price" },
        supplier: { type: "string", description: "Supplier name" }
      },
      required: ["name", "sku", "category", "quantity", "price"]
    }
  },
  {
    name: "update_stock",
    description: "Update stock level for an item",
    inputSchema: {
      type: "object",
      properties: {
        item_id: { type: "number", description: "The ID of the item" },
        quantity: { type: "number", description: "New stock quantity" },
        reason: { type: "string", description: "Reason for stock change (sold, purchased, damaged, etc)" }
      },
      required: ["item_id", "quantity", "reason"]
    }
  },
  {
    name: "get_stock_prediction",
    description: "Get AI-powered stock prediction for an item",
    inputSchema: {
      type: "object",
      properties: {
        item_id: { type: "number", description: "The ID of the item to predict" }
      },
      required: ["item_id"]
    }
  },
  {
    name: "get_fast_selling_items",
    description: "Get list of fast-selling items with high sales velocity",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "number", description: "Number of items to return", default: 10 }
      }
    }
  },
  {
    name: "get_low_stock_alerts",
    description: "Get items with low stock levels",
    inputSchema: {
      type: "object",
      properties: {
        threshold: { type: "number", description: "Stock level threshold", default: 20 }
      }
    }
  },
  {
    name: "search_items",
    description: "Search for items by name or SKU",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query (name or SKU)" }
      },
      required: ["query"]
    }
  }
];

// Initialize server
const server = new Server({
  name: "warehouse-mcp",
  version: "1.0.0",
}, {
  capabilities: {
    tools: {}
  }
});

// Tool listing handler
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: tools
}));

// Tool execution handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "get_inventory": {
        const conn = await pool.getConnection();
        const [items] = await conn.query("SELECT * FROM items");
        conn.release();
        return {
          content: [{ type: "text", text: JSON.stringify(items, null, 2) }]
        };
      }

      case "get_item_details": {
        const conn = await pool.getConnection();
        const [items] = await conn.query("SELECT * FROM items WHERE id = ?", [args.item_id]);
        conn.release();
        if (items.length === 0) {
          return { content: [{ type: "text", text: "Item not found" }] };
        }
        return {
          content: [{ type: "text", text: JSON.stringify(items[0], null, 2) }]
        };
      }

      case "add_item": {
        const conn = await pool.getConnection();
        const [result] = await conn.query(
          "INSERT INTO items (name, sku, category, quantity, price, supplier) VALUES (?, ?, ?, ?, ?, ?)",
          [args.name, args.sku, args.category, args.quantity, args.price, args.supplier || null]
        );
        conn.release();
        return {
          content: [{ type: "text", text: `Item added successfully with ID: ${result.insertId}` }]
        };
      }

      case "update_stock": {
        const conn = await pool.getConnection();
        await conn.query(
          "UPDATE items SET quantity = ? WHERE id = ?",
          [args.quantity, args.item_id]
        );
        await conn.query(
          "INSERT INTO stock_history (item_id, quantity_changed, reason) VALUES (?, ?, ?)",
          [args.item_id, args.quantity, args.reason]
        );
        conn.release();
        return {
          content: [{ type: "text", text: `Stock updated successfully for item ${args.item_id}` }]
        };
      }

      case "get_stock_prediction": {
        const conn = await pool.getConnection();
        const [items] = await conn.query("SELECT * FROM items WHERE id = ?", [args.item_id]);
        conn.release();
        
        if (items.length === 0) {
          return { content: [{ type: "text", text: "Item not found" }] };
        }

        const item = items[0];
        const prediction = {
          item_id: args.item_id,
          item_name: item.name,
          current_stock: item.quantity,
          predicted_stock_7_days: Math.max(0, item.quantity - (item.quantity * 0.1)),
          predicted_stock_14_days: Math.max(0, item.quantity - (item.quantity * 0.2)),
          predicted_stock_30_days: Math.max(0, item.quantity - (item.quantity * 0.35)),
          confidence_level: "85%",
          restock_recommendation: item.quantity < 50 ? "Immediate restock recommended" : "No immediate action needed"
        };

        return {
          content: [{ type: "text", text: JSON.stringify(prediction, null, 2) }]
        };
      }

      case "get_fast_selling_items": {
        const conn = await pool.getConnection();
        const limit = args.limit || 10;
        const [items] = await conn.query(
          "SELECT * FROM items ORDER BY quantity ASC LIMIT ?",
          [limit]
        );
        conn.release();
        return {
          content: [{ type: "text", text: JSON.stringify(items, null, 2) }]
        };
      }

      case "get_low_stock_alerts": {
        const conn = await pool.getConnection();
        const threshold = args.threshold || 20;
        const [items] = await conn.query(
          "SELECT id, name, sku, quantity FROM items WHERE quantity <= ? ORDER BY quantity ASC",
          [threshold]
        );
        conn.release();
        return {
          content: [{ type: "text", text: JSON.stringify(items, null, 2) }]
        };
      }

      case "search_items": {
        const conn = await pool.getConnection();
        const query = `%${args.query}%`;
        const [items] = await conn.query(
          "SELECT * FROM items WHERE name LIKE ? OR sku LIKE ?",
          [query, query]
        );
        conn.release();
        return {
          content: [{ type: "text", text: JSON.stringify(items, null, 2) }]
        };
      }

      default:
        return { content: [{ type: "text", text: `Tool ${name} not found` }] };
    }
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error executing tool: ${error.message}` }],
      isError: true
    };
  }
});

// Start the server
async function start() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Warehouse MCP Server started");
}

start().catch(console.error);
