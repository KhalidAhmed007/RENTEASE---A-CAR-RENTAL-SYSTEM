import { Router } from 'express';
import { createBooking, cancelBooking, getMyBookings, getBookingById, clearBookingHistory } from '../../controllers/bookingController';
import { protect } from '../../middlewares/authMiddleware';
import { createBookingValidation } from '../../validators/bookingValidators';

const router = Router();

router.use(protect);

router.get('/my-bookings', getMyBookings);
router.delete('/history', clearBookingHistory); // Delete past bookings (completed/cancelled)
router.get('/:id', getBookingById);          // View booking detail
router.post('/', createBookingValidation, createBooking);
router.post('/:id/cancel', cancelBooking);

export default router;
