-- Run this script once to migrate the existing users table
-- It safely adds new columns if they don't already exist

USE warehouse_db;

-- Add name column (maps to old username)
ALTER TABLE users
  CHANGE COLUMN username name VARCHAR(100) NOT NULL;

-- Add phone and address
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS phone VARCHAR(20) AFTER email,
  ADD COLUMN IF NOT EXISTS address TEXT AFTER phone;

-- Add supervisor to role enum
ALTER TABLE users
  MODIFY COLUMN role ENUM('admin', 'manager', 'supervisor', 'staff') DEFAULT 'staff';

-- Add email verification columns
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS isVerified BOOLEAN DEFAULT FALSE AFTER isActive,
  ADD COLUMN IF NOT EXISTS verificationCode VARCHAR(6) AFTER isVerified,
  ADD COLUMN IF NOT EXISTS verificationExpires DATETIME AFTER verificationCode,
  ADD COLUMN IF NOT EXISTS resetCode VARCHAR(6) AFTER verificationExpires,
  ADD COLUMN IF NOT EXISTS resetExpires DATETIME AFTER resetCode;
