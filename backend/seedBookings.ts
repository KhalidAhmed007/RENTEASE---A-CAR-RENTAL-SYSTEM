import mongoose from 'mongoose';
import User from './src/models/User';
import Car from './src/models/Car';
import Booking from './src/models/Booking';
import Payment from './src/models/Payment';
import { env } from './src/config/env';
import logger from './src/utils/logger';

const ATLAS_OPTIONS: mongoose.ConnectOptions = {
  serverSelectionTimeoutMS: 15000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 15000,
  family: 4,
};

const seedBookings = async () => {
  try {
    const uri = env.mongoUri.replace(/:([^@]+)@/, ':****@');
    logger.info(`Attempting MongoDB Atlas connection to: ${uri}`);
    await mongoose.connect(env.mongoUri, ATLAS_OPTIONS);
    logger.info('Connected to MongoDB');

    // 1. Get all regular users (not admins) to seed data for
    let users = await User.find();
    if (users.length === 0) {
      logger.info('No users found. Creating a demo user...');
      const bcrypt = require('bcrypt');
      const passwordHash = await bcrypt.hash('Password123!', 10);
      const demoUser = await User.create({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        passwordHash,
        phoneNumber: '1234567890',
        licenseNumber: 'DL1234567890',
        role: 'user'
      });
      users = [demoUser];
    }

    // 2. Get some cars
    const cars = await Car.find();
    if (cars.length < 5) {
      logger.error('Not enough cars found in database. Please seed cars first.');
      process.exit(1);
    }

    // Clear existing bookings & payments
    await Booking.deleteMany({});
    await Payment.deleteMany({});
    logger.info('Cleared existing bookings and payments.');

    // We will seed bookings for ALL users so whoever logs in sees data
    for (const user of users) {
      logger.info(`Seeding bookings for user: ${user.email}`);

      // 3 Upcoming Bookings
      for (let i = 0; i < 3; i++) {
        const car = cars[i % cars.length];
        const start = new Date();
        start.setDate(start.getDate() + (i + 1) * 3); // 3, 6, 9 days in future
        const end = new Date(start);
        end.setDate(end.getDate() + 2); // 2 days trip
        
        const booking = await Booking.create({
          user: user._id,
          car: car._id,
          startDate: start,
          endDate: end,
          totalDays: 2,
          dailyRateAtBooking: car.dailyRate,
          totalAmount: 2 * car.dailyRate,
          status: 'confirmed',
          paymentStatus: 'paid'
        });

        const payment = await Payment.create({
          booking: booking._id,
          user: user._id,
          paymentProvider: 'razorpay',
          amount: booking.totalAmount,
          currency: 'INR',
          status: 'succeeded',
          paidAt: new Date()
        });

        booking.payment = payment._id;
        await booking.save();
      }

      // 5 Previous Bookings
      for (let i = 0; i < 5; i++) {
        const car = cars[(i + 3) % cars.length];
        const start = new Date();
        start.setDate(start.getDate() - (i + 1) * 7); // 7, 14, 21, 28, 35 days in past
        const end = new Date(start);
        end.setDate(end.getDate() + 3); // 3 days trip
        
        const booking = await Booking.create({
          user: user._id,
          car: car._id,
          startDate: start,
          endDate: end,
          totalDays: 3,
          dailyRateAtBooking: car.dailyRate,
          totalAmount: 3 * car.dailyRate,
          status: 'completed',
          paymentStatus: 'paid'
        });

        const payment = await Payment.create({
          booking: booking._id,
          user: user._id,
          paymentProvider: 'razorpay',
          amount: booking.totalAmount,
          currency: 'INR',
          status: 'succeeded',
          paidAt: start
        });

        booking.payment = payment._id;
        await booking.save();
      }

      // 2 Cancelled Bookings
      for (let i = 0; i < 2; i++) {
        const car = cars[(i + 8) % cars.length];
        const start = new Date();
        start.setDate(start.getDate() + (i + 1) * 5);
        const end = new Date(start);
        end.setDate(end.getDate() + 1); // 1 day trip
        
        const booking = await Booking.create({
          user: user._id,
          car: car._id,
          startDate: start,
          endDate: end,
          totalDays: 1,
          dailyRateAtBooking: car.dailyRate,
          totalAmount: car.dailyRate,
          status: 'cancelled',
          paymentStatus: 'refunded',
          cancellationReason: 'Change of plans'
        });

        const payment = await Payment.create({
          booking: booking._id,
          user: user._id,
          paymentProvider: 'razorpay',
          amount: booking.totalAmount,
          currency: 'INR',
          status: 'refunded',
          paidAt: new Date()
        });

        booking.payment = payment._id;
        await booking.save();
      }
    }

    logger.info('Successfully seeded bookings for all users.');
    process.exit(0);
  } catch (error) {
    logger.error('Error seeding bookings:', error);
    process.exit(1);
  }
};

seedBookings();
