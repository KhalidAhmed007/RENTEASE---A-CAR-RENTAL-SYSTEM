import { body, query } from 'express-validator';
import { validate } from './authValidators';

export const createCarValidation = [
  body('make').trim().notEmpty().withMessage('Make is required'),
  body('carModel').trim().notEmpty().withMessage('Model is required'),
  body('year').isInt({ min: 2000, max: new Date().getFullYear() + 1 }),
  body('registrationNumber').trim().notEmpty(),
  body('category').isIn(['sedan', 'suv', 'luxury', 'electric']),
  body('dailyRate').isFloat({ min: 0 }),
  body('location.address').notEmpty(),
  body('location.coordinates').isArray({ min: 2, max: 2 }),
  validate
];

export const searchValidation = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('minPrice').optional().isFloat({ min: 0 }),
  query('maxPrice').optional().isFloat({ min: 0 }),
  query('category').optional().isString(),
  query('sort').optional().isIn(['priceAsc', 'priceDesc', 'newest', 'rating']),
  validate
];
