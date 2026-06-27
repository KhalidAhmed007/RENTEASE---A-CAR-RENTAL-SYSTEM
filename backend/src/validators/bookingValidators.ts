import { body } from 'express-validator';
import { validate } from './authValidators';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
dayjs.extend(isSameOrBefore);

export const createBookingValidation = [
  body('carId').isMongoId().withMessage('Invalid Car ID'),
  body('startDate')
    .isISO8601()
    .custom((value: string) => {
      if (dayjs(value).isBefore(dayjs().startOf('day'))) throw new Error('Start date cannot be in the past');
      return true;
    }),
  body('endDate')
    .isISO8601()
    .custom((value: string, meta) => {
      if (dayjs(value).isSameOrBefore(dayjs(meta.req.body?.startDate))) {
        throw new Error('End date must be strictly after start date');
      }
      return true;
    }),
  validate
];

