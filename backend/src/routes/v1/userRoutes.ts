import { Router } from 'express';
import { 
  getMyProfile, 
  updateMyProfile, 
  updateMyPassword, 
  getMyBookingHistory
} from '../../controllers/userController';
import { protect } from '../../middlewares/authMiddleware';
import { 
  updateProfileValidation, 
  updatePasswordValidation,
  bookingHistoryPaginationValidation
} from '../../validators/userValidators';

const router = Router();

router.use(protect);

router.get('/me', getMyProfile);
router.patch('/me', updateProfileValidation, updateMyProfile);
router.patch('/password', updatePasswordValidation, updateMyPassword);
router.get('/bookings', bookingHistoryPaginationValidation, getMyBookingHistory);

export default router;
