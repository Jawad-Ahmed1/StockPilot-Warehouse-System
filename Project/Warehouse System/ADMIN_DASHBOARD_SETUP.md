# Admin Dashboard CRUD Setup Guide

## Project Overview

This admin dashboard provides complete CRUD (Create, Read, Update, Delete) operations for warehouse item management with the following features:

### Frontend Features:
- ✅ Admin Dashboard with responsive design
- ✅ Add new items with form validation
- ✅ Edit existing items
- ✅ Delete items with confirmation
- ✅ Search items by name or SKU
- ✅ Filter items by category
- ✅ Display statistics (total items, total stock, categories)
- ✅ Multi-location support
- ✅ Beautiful modern UI with Lucide icons

### Backend Features:
- ✅ Node.js + Express API server
- ✅ MySQL database with proper schema
- ✅ RESTful API endpoints
- ✅ Input validation
- ✅ Error handling
- ✅ CORS support

---

## Installation & Setup Instructions

### Step 1: Database Setup (MySQL)

#### Prerequisites:
- MySQL Server installed and running
- MySQL command line or GUI tool (Workbench, phpMyAdmin)

#### Setup:
1. Open MySQL command line or MySQL Workbench
2. Run the database setup script:

```bash
# Using command line
mysql -u root -p < warehouse-backend/database.sql

# Or if prompted for password
mysql -u root -pYOUR_PASSWORD < warehouse-backend/database.sql
```

3. Verify database was created:
```sql
SHOW DATABASES;
USE warehouse_db;
SHOW TABLES;
```

#### Database includes:
- `items` table - Main inventory items
- `stock_history` table - Track stock movements
- `users` table - User authentication
- `locations` table - Warehouse locations
- `categories` table - Product categories
- Sample data included

---

### Step 2: Backend Setup (Node.js)

#### Prerequisites:
- Node.js (v16+) and npm installed
- Navigate to: `Project/Warehouse System/warehouse-backend/`

#### Setup:
1. Install dependencies:
```bash
npm install
```

2. Configure environment variables (`.env` file):
```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=warehouse_db

CORS_ORIGIN=http://localhost:5173
```

**Replace `your_password` with your actual MySQL password**

3. Test database connection:
```bash
npm run dev
```

You should see: `Server running on port 5000`

4. Test API health:
```
http://localhost:5000/api/health
```

---

### Step 3: Frontend Setup (React)

#### Prerequisites:
- Navigate to: `Project/Warehouse System/warehouse-frontend/`

#### Setup:
1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

Frontend will be available at: `http://localhost:5173`

3. Access Admin Dashboard:
- Navigate to: `http://localhost:5173`
- Click "Admin Dashboard" or access directly

---

## Running the Complete System

### In Multiple Terminal Windows:

**Terminal 1 - Backend Server:**
```bash
cd Project/Warehouse\ System/warehouse-backend
npm run dev
```
Expected: `Server running on port 5000`

**Terminal 2 - Frontend Development:**
```bash
cd Project/Warehouse\ System/warehouse-frontend
npm run dev
```
Expected: `Local: http://localhost:5173/`

**Terminal 3 - MySQL (if needed):**
```bash
# Windows
mysql -u root -p

# Or keep MySQL service running in background
```

---

## Admin Dashboard Usage

### Adding Items:
1. Click "Add New Item" button
2. Fill in the form fields:
   - Product Name *
   - SKU * (unique identifier)
   - Category * (select from dropdown)
   - Location * (select warehouse location)
   - Quantity *
   - Price *
   - Supplier (optional)
   - Description (optional)
3. Click "Add Item" to save

### Viewing Items:
- All items displayed in table format
- Shows: Product Name, SKU, Category, Quantity, Price, Location, Supplier
- Statistics panel shows:
  - Total Items count
  - Total Stock quantity
  - Number of Categories

### Searching Items:
1. Use search box to find items by:
   - Product Name
   - SKU
2. Results update in real-time

### Filtering Items:
1. Use category dropdown to filter by category
2. Select "All Categories" to reset filter

### Editing Items:
1. Click the edit icon (pencil) on any item row
2. Modal opens with item data pre-filled
3. Make changes to any field
4. Click "Update Item" to save

### Deleting Items:
1. Click delete icon (trash) on item row
2. Confirm deletion in popup
3. Item removed from database

---

## API Endpoints

### Base URL: `http://localhost:5000/api`

#### Items Endpoints:
```
GET    /items              - Get all items
GET    /items/:id          - Get single item
POST   /items              - Create new item
PUT    /items/:id          - Update item
DELETE /items/:id          - Delete item
GET    /items/search       - Search/filter items

Health Check:
GET    /health             - Server status
```

#### Request Example (Create Item):
```json
POST /api/items
{
  "productName": "Laptop",
  "sku": "SKU001",
  "category": "Electronics",
  "quantity": 25,
  "price": 899.99,
  "location": "Warehouse A",
  "supplier": "Tech Supplies Inc",
  "description": "High performance laptop"
}
```

---

## Database Schema Overview

### Items Table
```
id              INT (Primary Key, Auto Increment)
productName     VARCHAR(255)
sku             VARCHAR(100) UNIQUE
category        VARCHAR(100)
quantity        INT
price           DECIMAL(10, 2)
location        VARCHAR(100)
supplier        VARCHAR(255)
description     TEXT
createdAt       TIMESTAMP
updatedAt       TIMESTAMP
```

### Available Categories:
- Electronics
- Office Supplies
- Raw Materials
- Packaging
- Other

### Available Locations:
- Warehouse A (5000 capacity)
- Warehouse B (3000 capacity)
- Warehouse C (2000 capacity)
- Storage Room (500 capacity)

---

## Troubleshooting

### Backend won't start - "Connection refused"
**Solution:** 
- Check MySQL is running
- Verify DB credentials in `.env`
- Run: `mysql -u root -p` to test connection

### Frontend can't connect to backend
**Solution:**
- Check backend is running on port 5000
- Verify CORS_ORIGIN in backend `.env` matches frontend URL
- Check browser console for errors

### Port already in use
**Solution:**
```bash
# Windows - Find and kill process on port
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

### Database tables not created
**Solution:**
```bash
# Re-run setup script
mysql -u root -p warehouse_db < database.sql

# Or verify connection and run SQL directly
```

---

## Next Steps / Future Enhancements

1. **Authentication**: Add login/logout with role-based access
2. **Stock History**: Track and display all stock movements
3. **Stock Alerts**: Notify when items are low in stock
4. **AI Predictions**: Implement demand forecasting
5. **Reports**: Generate inventory reports and analytics
6. **Batch Operations**: Import/export items in bulk
7. **User Management**: Admin can manage users and roles
8. **Real-time Updates**: WebSocket notifications for stock changes
9. **Mobile Responsive**: Further optimize for mobile devices
10. **Advanced Search**: Add more search filters and options

---

## File Structure

```
Project/Warehouse System/
├── warehouse-frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx      (NEW - Main admin page)
│   │   │   └── AdminDashboard.css      (NEW - Styling)
│   │   ├── services/
│   │   │   ├── authService.js
│   │   │   └── itemService.js          (NEW - API calls)
│   │   ├── App.jsx                     (UPDATED - Added admin route)
│   │   └── ...
│   ├── package.json                    (UPDATED - Added axios)
│   └── ...
│
├── warehouse-backend/                  (NEW - Complete backend)
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js            (Database connection)
│   │   ├── controllers/
│   │   │   └── itemController.js      (CRUD logic)
│   │   ├── routes/
│   │   │   └── itemRoutes.js          (API routes)
│   │   └── server.js                  (Express server)
│   ├── .env                           (Environment config)
│   ├── .gitignore
│   ├── database.sql                   (Database schema)
│   ├── package.json
│   └── README.md
│
└── ...
```

---

## Support & Documentation

- **API Documentation**: See `warehouse-backend/README.md`
- **Frontend Code Comments**: Check AdminDashboard.jsx for details
- **Database Schema**: See database.sql for table structures
- **Error Messages**: Check browser console and server logs

---

Happy coding! 🚀
