import pool from '../config/database.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Resend } from 'resend';

// ─── Email via Resend ─────────────────────────────────────────────────────────

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || 'Stock Pilot <onboarding@resend.dev>',
    to,
    subject,
    html,
  });
  if (error) throw new Error(error.message);
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const otpExpiry = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() + 15); // 15 min window
  return d;
};

// ─── Signup ──────────────────────────────────────────────────────────────────

export const signup = async (req, res) => {
  const { name, email, phone, address, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      message: 'Password must be at least 8 characters with 1 uppercase letter and 1 number',
    });
  }

  const connection = await pool.getConnection();
  try {
    const [existing] = await connection.query(
      'SELECT id FROM users WHERE email = ?',
      [email.toLowerCase()]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const otp = generateOTP();
    const expires = otpExpiry();
    const allowedRoles = ['admin', 'manager', 'supervisor', 'staff'];
    const userRole = allowedRoles.includes(role) ? role : 'staff';

    await connection.query(
      `INSERT INTO users (name, email, phone, address, password, role, isVerified, verificationCode, verificationExpires)
       VALUES (?, ?, ?, ?, ?, ?, FALSE, ?, ?)`,
      [name, email.toLowerCase(), phone || null, address || null, hashedPassword, userRole, otp, expires]
    );

    // Respond immediately — don't block on email
    res.status(201).json({
      success: true,
      message: 'Account created! Check your email for the verification code.',
      email: email.toLowerCase(),
    });

    // Send email in background (non-blocking)
    sendEmail({
      to: email,
      subject: 'Verify your Stock Pilot account',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:24px;border:1px solid #e0e0e0;border-radius:8px">
          <h2 style="color:#667eea">Stock Pilot</h2>
          <p>Hi <strong>${name}</strong>,</p>
          <p>Thanks for signing up! Use the code below to verify your email address:</p>
          <div style="text-align:center;margin:32px 0">
            <span style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#667eea">${otp}</span>
          </div>
          <p style="color:#888;font-size:13px">This code expires in <strong>15 minutes</strong>. If you didn't create an account, ignore this email.</p>
        </div>
      `,
    }).catch(err => console.error('Email send failed (non-blocking):', err.message));
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Failed to create account' });
  } finally {
    connection.release();
  }
};

// ─── Verify Email ─────────────────────────────────────────────────────────────

export const verifyEmail = async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ message: 'Email and code are required' });
  }

  const connection = await pool.getConnection();
  try {
    const [users] = await connection.query(
      'SELECT id, verificationCode, verificationExpires, isVerified FROM users WHERE email = ?',
      [email.toLowerCase()]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    if (user.verificationCode !== code) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    if (new Date() > new Date(user.verificationExpires)) {
      return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
    }

    await connection.query(
      'UPDATE users SET isVerified = TRUE, verificationCode = NULL, verificationExpires = NULL WHERE id = ?',
      [user.id]
    );

    res.json({ success: true, message: 'Email verified successfully! You can now log in.' });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ message: 'Verification failed' });
  } finally {
    connection.release();
  }
};

// ─── Resend Verification Code ─────────────────────────────────────────────────

export const resendVerificationCode = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  const connection = await pool.getConnection();
  try {
    const [users] = await connection.query(
      'SELECT id, name, isVerified FROM users WHERE email = ?',
      [email.toLowerCase()]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'Email not found' });
    }

    const user = users[0];

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    const otp = generateOTP();
    const expires = otpExpiry();

    await connection.query(
      'UPDATE users SET verificationCode = ?, verificationExpires = ? WHERE id = ?',
      [otp, expires, user.id]
    );

    // Respond immediately
    res.json({ success: true, message: 'New verification code sent to your email' });

    // Send email in background
    sendEmail({
      to: email,
      subject: 'New verification code – Stock Pilot',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:24px;border:1px solid #e0e0e0;border-radius:8px">
          <h2 style="color:#667eea">Stock Pilot</h2>
          <p>Hi <strong>${user.name}</strong>,</p>
          <p>Here is your new verification code:</p>
          <div style="text-align:center;margin:32px 0">
            <span style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#667eea">${otp}</span>
          </div>
          <p style="color:#888;font-size:13px">This code expires in <strong>15 minutes</strong>.</p>
        </div>
      `,
    }).catch(err => console.error('Resend email failed:', err.message));
  } catch (error) {
    console.error('Resend code error:', error);
    res.status(500).json({ message: 'Failed to resend verification code' });
  } finally {
    connection.release();
  }
};

// ─── Login ───────────────────────────────────────────────────────────────────

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const connection = await pool.getConnection();
  try {
    const [users] = await connection.query(
      'SELECT id, name, email, phone, address, password, role, isVerified, isActive FROM users WHERE email = ?',
      [email.toLowerCase()]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = users[0];

    if (!user.isActive) {
      return res.status(403).json({ message: 'Your account has been deactivated. Contact admin.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: 'Please verify your email before logging in',
        requiresVerification: true,
        email: user.email,
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const { password: _pw, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  } finally {
    connection.release();
  }
};

// ─── Request Password Reset ───────────────────────────────────────────────────

export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  const connection = await pool.getConnection();
  try {
    const [users] = await connection.query(
      'SELECT id, name FROM users WHERE email = ?',
      [email.toLowerCase()]
    );

    // Always return success to prevent email enumeration
    if (users.length === 0) {
      return res.json({ success: true, message: 'If that email exists, a reset code has been sent' });
    }

    const user = users[0];
    const otp = generateOTP();
    const expires = otpExpiry();

    await connection.query(
      'UPDATE users SET resetCode = ?, resetExpires = ? WHERE id = ?',
      [otp, expires, user.id]
    );

    // Respond immediately
    res.json({ success: true, message: 'If that email exists, a reset code has been sent' });

    // Send email in background
    sendEmail({
      to: email,
      subject: 'Password reset code – Stock Pilot',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:24px;border:1px solid #e0e0e0;border-radius:8px">
          <h2 style="color:#667eea">Stock Pilot</h2>
          <p>Hi <strong>${user.name}</strong>,</p>
          <p>Use the code below to reset your password:</p>
          <div style="text-align:center;margin:32px 0">
            <span style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#e53935">${otp}</span>
          </div>
          <p style="color:#888;font-size:13px">This code expires in <strong>15 minutes</strong>. If you didn't request a password reset, ignore this email.</p>
        </div>
      `,
    }).catch(err => console.error('Reset email failed:', err.message));
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ message: 'Failed to send reset code' });
  } finally {
    connection.release();
  }
};

// ─── Reset Password ───────────────────────────────────────────────────────────

export const resetPassword = async (req, res) => {
  const { email, code, newPassword } = req.body;

  if (!email || !code || !newPassword) {
    return res.status(400).json({ message: 'Email, code, and new password are required' });
  }

  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(newPassword)) {
    return res.status(400).json({
      message: 'Password must be at least 8 characters with 1 uppercase letter and 1 number',
    });
  }

  const connection = await pool.getConnection();
  try {
    const [users] = await connection.query(
      'SELECT id, resetCode, resetExpires FROM users WHERE email = ?',
      [email.toLowerCase()]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    if (!user.resetCode || user.resetCode !== code) {
      return res.status(400).json({ message: 'Invalid reset code' });
    }

    if (new Date() > new Date(user.resetExpires)) {
      return res.status(400).json({ message: 'Reset code has expired. Please request a new one.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await connection.query(
      'UPDATE users SET password = ?, resetCode = NULL, resetExpires = NULL WHERE id = ?',
      [hashedPassword, user.id]
    );

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Failed to reset password' });
  } finally {
    connection.release();
  }
};
