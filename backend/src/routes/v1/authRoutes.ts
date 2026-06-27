import { Router } from 'express';
import { register, login, logout, refresh } from '../../controllers/authController';
import { registerValidation, loginValidation } from '../../validators/authValidators';
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 100,                 // 100 login attempts per window per IP during development
  // Use a JSON object so the frontend error handler can read `response.data.message`
  message: { success: false, message: 'Too many login attempts, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const router = Router();

router.post('/register', registerValidation, register);
router.post('/login', authLimiter, loginValidation, login);
router.post('/logout', logout);
router.post('/refresh-token', refresh); 

export default router;
