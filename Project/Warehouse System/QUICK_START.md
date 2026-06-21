# Quick Start - Admin Dashboard

## What's Been Created

✅ **Admin Dashboard UI** - Beautiful React component with CRUD operations
✅ **Backend API Server** - Node.js/Express with full REST endpoints
✅ **MySQL Database** - Complete schema with sample data
✅ **API Integration** - Frontend connected to backend

---

## Quick Start (3 Steps)

### 1️⃣ Setup Database (One-time)

Open MySQL command line and run:
```bash
mysql -u root -p < warehouse-backend/database.sql
```

Or copy `warehouse-backend/database.sql` contents into MySQL Workbench.

**Update `.env` file with your MySQL password**

### 2️⃣ Start Backend

```bash
cd warehouse-backend
npm install
npm run dev
```

✓ Server runs on http://localhost:5000

### 3️⃣ Start Frontend

```bash
cd warehouse-frontend
npm install
npm run dev
```

✓ Open http://localhost:5173 in browser

---

## What You Get

### Admin Dashboard Features:
- ➕ Add items with validation
- ✏️ Edit existing items
- 🗑️ Delete items safely
- 🔍 Search by product name/SKU
- 📂 Filter by category
- 📊 View statistics (total items, stock, categories)
- 🏢 Multi-location support (4 warehouses)
- 📱 Responsive design

### Database:
- Items table with all inventory data
- Stock history for tracking movements
- Users, locations, and categories tables
- Pre-loaded sample data

### API Endpoints:
- GET /api/items
- GET /api/items/:id
- POST /api/items
- PUT /api/items/:id
- DELETE /api/items/:id

---

## Key Files Created

### Frontend:
```
warehouse-frontend/
├── src/pages/AdminDashboard.jsx (Main component)
├── src/pages/AdminDashboard.css (Beautiful styling)
├── src/services/itemService.js  (API calls)
└── src/App.jsx (Updated with admin route)
```

### Backend:
```
warehouse-backend/
├── src/server.js (Express setup)
├── src/controllers/itemController.js (CRUD logic)
├── src/routes/itemRoutes.js (API routes)
├── src/config/database.js (MySQL connection)
├── database.sql (Schema & sample data)
├── .env (Configuration)
└── package.json (Dependencies)
```

---

## Database Includes:

### Items Table
- Product name, SKU, category, quantity, price
- Location (4 warehouses available)
- Supplier and description
- Automatic timestamps

### Sample Categories:
- Electronics
- Office Supplies  
- Raw Materials
- Packaging
- Other

### Sample Locations:
- Warehouse A (5000 capacity)
- Warehouse B (3000 capacity)
- Warehouse C (2000 capacity)
- Storage Room (500 capacity)

---

## Troubleshooting

**Backend won't start?**
- Check MySQL is running
- Update DB password in `.env`

**Frontend can't reach backend?**
- Ensure backend is on port 5000
- Check CORS_ORIGIN in `.env`

**Port already in use?**
- Change PORT in `.env`

---

## Next Steps

1. Run the setup steps above
2. Access admin dashboard at http://localhost:5173
3. Click "Add New Item" to start adding inventory
4. Use search/filter to find items
5. Edit or delete items as needed

**For detailed documentation, see: ADMIN_DASHBOARD_SETUP.md**

---

Enjoy your admin dashboard! 🚀
