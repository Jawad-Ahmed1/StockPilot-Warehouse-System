-- Create Database
CREATE DATABASE IF NOT EXISTS warehouse_db;
USE warehouse_db;

-- Create Items Table
CREATE TABLE IF NOT EXISTS items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  productName VARCHAR(255) NOT NULL,
  sku VARCHAR(100) NOT NULL UNIQUE,
  category VARCHAR(100) NOT NULL,
  quantity INT NOT NULL DEFAULT 0,
  price DECIMAL(10, 2) NOT NULL,
  location VARCHAR(100) NOT NULL,
  supplier VARCHAR(255),
  description TEXT,
  thresholdQuantity INT DEFAULT 10,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_location (location),
  INDEX idx_sku (sku)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Stock History Table for tracking stock movements
CREATE TABLE IF NOT EXISTS stock_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  itemId INT NOT NULL,
  transactionType ENUM('IN', 'OUT', 'ADJUSTMENT') NOT NULL,
  quantity INT NOT NULL,
  previousQuantity INT NOT NULL,
  newQuantity INT NOT NULL,
  reason VARCHAR(255),
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (itemId) REFERENCES items(id) ON DELETE CASCADE,
  INDEX idx_itemId (itemId),
  INDEX idx_createdAt (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Users Table for authentication
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20),
  address TEXT,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'manager', 'supervisor', 'staff') DEFAULT 'staff',
  isVerified BOOLEAN DEFAULT FALSE,
  isActive BOOLEAN DEFAULT TRUE,
  verificationCode VARCHAR(6),
  verificationExpires DATETIME,
  resetCode VARCHAR(6),
  resetExpires DATETIME,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Locations Table
CREATE TABLE IF NOT EXISTS locations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  capacity INT,
  currentOccupancy INT DEFAULT 0,
  description TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Sales Transactions Table for AI analytics
CREATE TABLE IF NOT EXISTS sales_transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  itemId INT NOT NULL,
  quantitySold INT NOT NULL,
  totalSale DECIMAL(10, 2) NOT NULL,
  saleDate DATE NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (itemId) REFERENCES items(id) ON DELETE CASCADE,
  INDEX idx_itemId (itemId),
  INDEX idx_saleDate (saleDate)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample categories
INSERT INTO categories (name, description) VALUES
('Electronics', 'Electronic items and devices'),
('Office Supplies', 'General office and stationery supplies'),
('Raw Materials', 'Raw materials for production'),
('Packaging', 'Packaging materials'),
('Other', 'Miscellaneous items');

-- Insert sample locations
INSERT INTO locations (name, capacity) VALUES
('Warehouse A', 5000),
('Warehouse B', 3000),
('Warehouse C', 2000),
('Storage Room', 500);

-- Insert sample items
INSERT INTO items (productName, sku, category, quantity, price, location, supplier, description, thresholdQuantity) VALUES
('Laptop', 'SKU001', 'Electronics', 25, 899.99, 'Warehouse A', 'Tech Supplies Inc', 'High performance laptop', 10),
('Office Chair', 'SKU002', 'Office Supplies', 50, 249.99, 'Warehouse B', 'Furniture Plus', 'Ergonomic office chair', 15),
('Printer Paper', 'SKU003', 'Office Supplies', 500, 25.99, 'Storage Room', 'Paper Products Co', 'A4 printer paper 500 sheets', 100),
('Steel Wire', 'SKU004', 'Raw Materials', 100, 45.50, 'Warehouse C', 'Industrial Metals', 'High quality steel wire', 20),
('Cardboard Box', 'SKU005', 'Packaging', 1000, 2.99, 'Warehouse A', 'Box Manufacturers', 'Standard cardboard boxes', 200);

-- Insert sample sales data for AI analytics (last 30 days)
INSERT INTO sales_transactions (itemId, quantitySold, totalSale, saleDate) VALUES
(1, 3, 2699.97, DATE_SUB(CURDATE(), INTERVAL 29 DAY)),
(1, 4, 3599.96, DATE_SUB(CURDATE(), INTERVAL 28 DAY)),
(1, 2, 1799.98, DATE_SUB(CURDATE(), INTERVAL 27 DAY)),
(1, 5, 4499.95, DATE_SUB(CURDATE(), INTERVAL 26 DAY)),
(1, 3, 2699.97, DATE_SUB(CURDATE(), INTERVAL 25 DAY)),
(2, 5, 1249.95, DATE_SUB(CURDATE(), INTERVAL 29 DAY)),
(2, 6, 1499.94, DATE_SUB(CURDATE(), INTERVAL 28 DAY)),
(2, 4, 999.96, DATE_SUB(CURDATE(), INTERVAL 27 DAY)),
(2, 7, 1749.93, DATE_SUB(CURDATE(), INTERVAL 26 DAY)),
(2, 5, 1249.95, DATE_SUB(CURDATE(), INTERVAL 25 DAY)),
(3, 50, 1299.50, DATE_SUB(CURDATE(), INTERVAL 29 DAY)),
(3, 75, 1949.25, DATE_SUB(CURDATE(), INTERVAL 28 DAY)),
(3, 60, 1559.40, DATE_SUB(CURDATE(), INTERVAL 27 DAY)),
(3, 80, 2079.20, DATE_SUB(CURDATE(), INTERVAL 26 DAY)),
(3, 70, 1819.30, DATE_SUB(CURDATE(), INTERVAL 25 DAY)),
(4, 8, 364.00, DATE_SUB(CURDATE(), INTERVAL 29 DAY)),
(4, 10, 455.00, DATE_SUB(CURDATE(), INTERVAL 28 DAY)),
(4, 6, 273.00, DATE_SUB(CURDATE(), INTERVAL 27 DAY)),
(5, 100, 299.00, DATE_SUB(CURDATE(), INTERVAL 29 DAY)),
(5, 120, 358.80, DATE_SUB(CURDATE(), INTERVAL 28 DAY)),
(5, 80, 239.20, DATE_SUB(CURDATE(), INTERVAL 27 DAY));
