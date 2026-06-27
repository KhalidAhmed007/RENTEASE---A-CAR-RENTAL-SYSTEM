import { Router } from 'express';

const router = Router();

import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import carRoutes from './carRoutes';
import bookingRoutes from './bookingRoutes';
import paymentRoutes from './paymentRoutes';
import analyticsRoutes from './analyticsRoutes';
import reviewRoutes from './reviewRoutes';

// Health check route as part of v1 API
router.get('/status', (req, res) => {
  res.status(200).json({ status: 'API is running' });
});

// Mount modular routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/cars', carRoutes);
router.use('/bookings', bookingRoutes);
router.use('/payments', paymentRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/reviews', reviewRoutes);

export default router;

