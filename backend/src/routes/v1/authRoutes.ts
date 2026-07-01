import { Router } from 'express';
import { register, login, logout, refresh } from '../../controllers/authController';
import { registerValidation, loginValidation } from '../../validators/authValidators';
import { body } from 'express-validator';
import { validate } from '../../validators/authValidators';
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 100,                 // 100 login attempts per window per IP during development
  message: { success: false, message: 'Too many login attempts, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const router = Router();

router.post('/register', registerValidation, register);
router.post('/login', authLimiter, loginValidation, login);
router.post('/logout', logout);
router.post('/refresh-token', refresh);

// ─── Password Reset ───────────────────────────────────────────────────────────
// NOTE: Full email delivery (SMTP/SendGrid) is not configured in this deployment.
// These endpoints accept the request and return a safe acknowledgment so the
// frontend does not receive a 404. Wire up a real email provider to complete
// this feature in production.

router.post(
  '/forgot-password',
  [body('email').isEmail().normalizeEmail().withMessage('Valid email is required'), validate],
  (_req: import('express').Request, res: import('express').Response) => {
    // In production: generate a signed reset token, store a hash in the DB,
    // and send the link via email (SendGrid / Nodemailer / Resend).
    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a reset link has been sent.',
    });
  }
);

router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    validate,
  ],
  (_req: import('express').Request, res: import('express').Response) => {
    // In production: verify the token hash, find the user, update the password.
    res.status(501).json({
      success: false,
      message: 'Password reset via email is not yet configured on this server. Please contact support.',
    });
  }
);

export default router;
