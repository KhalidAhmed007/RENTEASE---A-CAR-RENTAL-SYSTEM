import { Router } from 'express';
import { getCars, getCarById, createCar, updateCar, deleteCar } from '../../controllers/carController';
import { protect, authorize } from '../../middlewares/authMiddleware';
import { adminActionLimiter } from '../../middlewares/rateLimiter';
import { uploadImages } from '../../config/cloudinary';
import { createCarValidation, searchValidation } from '../../validators/carValidators';

import { cacheResponse } from '../../middlewares/cacheMiddleware';

const router = Router();

router.get('/', searchValidation, cacheResponse(300), getCars);
router.get('/:id', cacheResponse(300), getCarById);

router.use(protect);
router.use(authorize('admin'));

router.post(
  '/', 
  adminActionLimiter,
  uploadImages.array('images', 5), 
  createCarValidation, 
  createCar
);

router.patch('/:id', adminActionLimiter, updateCar);
router.delete('/:id', adminActionLimiter, deleteCar);

export default router;
