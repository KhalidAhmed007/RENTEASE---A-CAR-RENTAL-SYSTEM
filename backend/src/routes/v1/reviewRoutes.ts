import { Router } from 'express';
import { createReview, getCarReviews, getMyReviews } from '../../controllers/reviewController';
import { protect } from '../../middlewares/authMiddleware';
import { body } from 'express-validator';
import { validate } from '../../validators/authValidators';

const router = Router();

const reviewValidation = [
  body('carId').isMongoId().withMessage('Invalid car ID'),
  body('bookingId').isMongoId().withMessage('Invalid booking ID'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isString().trim().isLength({ max: 1000 }).withMessage('Comment cannot exceed 1000 characters'),
  validate,
];

// Public — anyone can read reviews for a car
router.get('/car/:carId', getCarReviews);

// Protected — must be logged in to submit or view own reviews
router.use(protect);
router.post('/', reviewValidation, createReview);
router.get('/mine', getMyReviews);

export default router;
