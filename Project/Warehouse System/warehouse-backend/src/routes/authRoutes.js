import express from 'express';
import {
  signup,
  verifyEmail,
  resendVerificationCode,
  login,
  requestPasswordReset,
  resetPassword,
} from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerificationCode);
router.post('/login', login);
router.post('/request-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);

export default router;
