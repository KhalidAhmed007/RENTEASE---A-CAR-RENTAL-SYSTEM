import { Router } from 'express';
import {
  createOrder,
  verifyPayment,
  demoCapture,
  getMyPayments,
  getPaymentById,
  getPaymentByBooking,
} from '../../controllers/paymentController';
import { protect } from '../../middlewares/authMiddleware';

const router = Router();

// All payment routes require authentication
router.use(protect);

// ─── Payment Flow ─────────────────────────────────────────────────────────────
router.post('/create-order', createOrder);     // Step 1: Create Razorpay order
router.post('/verify', verifyPayment);          // Step 2: Verify after checkout
router.post('/demo-capture', demoCapture);      // Demo bypass (no gateway)

// ─── Payment Queries ──────────────────────────────────────────────────────────
router.get('/history', getMyPayments);                    // All user payments
router.get('/booking/:bookingId', getPaymentByBooking);   // Payment for a booking
router.get('/:id', getPaymentById);                       // Single payment by ID

export default router;
