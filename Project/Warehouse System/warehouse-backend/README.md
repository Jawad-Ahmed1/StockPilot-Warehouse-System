# Warehouse Backend API

Backend server for the AI Smart Warehouse Management System using Node.js, Express, and MySQL.

## Features

- **CRUD Operations**: Full Create, Read, Update, Delete functionality for items
- **Item Management**: Manage warehouse items with categories, locations, and stock tracking
- **Stock History**: Track all stock movements and transactions
- **Search & Filter**: Search items by name, SKU, category, or location
- **Validation**: Comprehensive input validation and error handling
- **CORS Support**: Configured for React frontend integration

## Prerequisites

- **Node.js** (v16 or higher)
- **MySQL** (v8.0 or higher)
- **npm** or **yarn**

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

#### Option A: Using MySQL Command Line

1. Open MySQL command line or MySQL Workbench
2. Run the SQL script to create the database:

```bash
mysql -u root -p < database.sql
```

Or copy and paste the contents of `database.sql` into MySQL directly.

#### Option B: Using MySQL GUI

1. Open MySQL Workbench or phpMyAdmin
2. Create a new database named `warehouse_db`
3. Copy and paste the contents of `database.sql` and execute it

### 3. Configure Environment Variables

Edit the `.env` file with your database credentials:

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

### 4. Start the Server

#### Development Mode (with auto-reload)
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Items Management

#### Get All Items
```
GET /api/items
```

#### Get Item by ID
```
GET /api/items/:id
```

#### Create New Item
```
POST /api/items
Content-Type: application/json

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

#### Update Item
```
PUT /api/items/:id
Content-Type: application/json

{
  "productName": "Laptop Pro",
  "sku": "SKU001",
  "category": "Electronics",
  "quantity": 30,
  "price": 1099.99,
  "location": "Warehouse A",
  "supplier": "Tech Supplies Inc",
  "description": "Updated description"
}
```

#### Delete Item
```
DELETE /api/items/:id
```

#### Search Items
```
GET /api/items/search?category=Electronics&location=Warehouse%20A
```

#### Health Check
```
GET /api/health
```

## Database Schema

### Items Table
- `id` (INT, Primary Key, Auto Increment)
- `productName` (VARCHAR 255, Required)
- `sku` (VARCHAR 100, Unique, Required)
- `category` (VARCHAR 100, Required)
- `quantity` (INT, Default: 0)
- `price` (DECIMAL 10,2, Required)
- `location` (VARCHAR 100, Required)
- `supplier` (VARCHAR 255, Optional)
- `description` (TEXT, Optional)
- `createdAt` (TIMESTAMP)
- `updatedAt` (TIMESTAMP)

### Stock History Table
Tracks all stock movements with transaction type, quantities, and reasons.

### Users Table
Stores user information for authentication (admin, manager, staff roles).

### Locations Table
Manages warehouse locations and their capacity.

### Categories Table
Manages product categories.

## Error Handling

The API returns appropriate HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Server Error

## CORS Configuration

The server is configured to accept requests from `http://localhost:5173` (React frontend).
Modify `CORS_ORIGIN` in `.env` to allow requests from other origins.

## Project Structure

```
warehouse-backend/
├── src/
│   ├── config/
│   │   └── database.js          # Database connection pool
│   ├── controllers/
│   │   └── itemController.js    # Item CRUD logic
│   ├── routes/
│   │   └── itemRoutes.js        # API routes
│   └── server.js                # Express server setup
├── .env                         # Environment variables
├── .gitignore                   # Git ignore rules
├── database.sql                 # Database schema
├── package.json                 # Dependencies
└── README.md                    # This file
```

## Development Tips

1. **Test API Endpoints**: Use Postman or Thunder Client to test API endpoints
2. **Check Logs**: Monitor server console for debugging information
3. **Database Connection**: Ensure MySQL service is running before starting the server
4. **Environment Variables**: Always keep sensitive information in `.env`

## Troubleshooting

### Connection Error: ECONNREFUSED
- Ensure MySQL is running
- Check DB_HOST and DB_PORT in `.env`
- Verify database credentials

### CORS Error
- Check that `CORS_ORIGIN` matches your frontend URL
- Ensure frontend is making requests to correct backend URL

### Port Already in Use
- Change `PORT` in `.env` to an available port
- Or kill the process using the port

## Future Enhancements

- [ ] JWT Authentication
- [ ] Role-based access control (RBAC)
- [ ] AI prediction models
- [ ] Real-time WebSocket updates
- [ ] Advanced analytics and reporting
- [ ] Batch operations
- [ ] Audit logging
