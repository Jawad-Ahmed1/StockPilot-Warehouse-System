import pool from '../config/database.js';
import bcrypt from 'bcryptjs';

// GET /api/users — admin only
export const getAllUsers = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const [users] = await connection.query(
      'SELECT id, name, email, phone, address, role, isVerified, isActive, createdAt FROM users ORDER BY createdAt DESC'
    );
    res.json({ success: true, data: users });
  } catch (err) {
    console.error('getAllUsers error:', err);
    res.status(500).json({ message: 'Failed to fetch users' });
  } finally {
    connection.release();
  }
};

// PATCH /api/users/:id/role — admin only
export const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  const allowed = ['admin', 'manager', 'supervisor', 'staff'];
  if (!allowed.includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }
  if (parseInt(id) === req.user.id) {
    return res.status(400).json({ message: 'You cannot change your own role' });
  }
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query('SELECT id FROM users WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
    await connection.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    res.json({ success: true, message: 'Role updated' });
  } catch (err) {
    console.error('updateUserRole error:', err);
    res.status(500).json({ message: 'Failed to update role' });
  } finally {
    connection.release();
  }
};

// PATCH /api/users/:id/status — admin only
export const toggleUserStatus = async (req, res) => {
  const { id } = req.params;
  if (parseInt(id) === req.user.id) {
    return res.status(400).json({ message: 'You cannot deactivate your own account' });
  }
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query('SELECT id, isActive FROM users WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
    const newStatus = !rows[0].isActive;
    await connection.query('UPDATE users SET isActive = ? WHERE id = ?', [newStatus, id]);
    res.json({ success: true, message: `User ${newStatus ? 'activated' : 'deactivated'}`, isActive: newStatus });
  } catch (err) {
    console.error('toggleUserStatus error:', err);
    res.status(500).json({ message: 'Failed to update user status' });
  } finally {
    connection.release();
  }
};

// GET /api/users/profile — any authenticated user
export const getProfile = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      'SELECT id, name, email, phone, address, role, isVerified, createdAt FROM users WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('getProfile error:', err);
    res.status(500).json({ message: 'Failed to fetch profile' });
  } finally {
    connection.release();
  }
};

// PUT /api/users/profile — any authenticated user
export const updateProfile = async (req, res) => {
  const { name, phone, address } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'Name is required' });
  }
  const connection = await pool.getConnection();
  try {
    await connection.query(
      'UPDATE users SET name = ?, phone = ?, address = ?, updatedAt = NOW() WHERE id = ?',
      [name.trim(), phone || null, address || null, req.user.id]
    );
    res.json({ success: true, message: 'Profile updated' });
  } catch (err) {
    console.error('updateProfile error:', err);
    res.status(500).json({ message: 'Failed to update profile' });
  } finally {
    connection.release();
  }
};

// PUT /api/users/profile/password — any authenticated user
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current and new password are required' });
  }
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(newPassword)) {
    return res.status(400).json({
      message: 'Password must be at least 8 characters with 1 uppercase letter and 1 number',
    });
  }
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });

    const match = await bcrypt.compare(currentPassword, rows[0].password);
    if (!match) return res.status(400).json({ message: 'Current password is incorrect' });

    const hashed = await bcrypt.hash(newPassword, 12);
    await connection.query('UPDATE users SET password = ?, updatedAt = NOW() WHERE id = ?', [hashed, req.user.id]);
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    console.error('changePassword error:', err);
    res.status(500).json({ message: 'Failed to change password' });
  } finally {
    connection.release();
  }
};
