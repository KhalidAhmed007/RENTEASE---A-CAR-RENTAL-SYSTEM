/**
 * ─── Production Seed Script ───────────────────────────────────────────────────
 * Populates the PostgreSQL database with:
 *   - 1 Admin account
 *   - 2 Demo users
 *   - 12 Demo cars
 *   - Sample bookings, payments & reviews
 *
 * Usage:
 *   npx ts-node scripts/seed.ts
 *   npx ts-node scripts/seed.ts --force   (clears existing data first)
 * ──────────────────────────────────────────────────────────────────────────────
 */

import { PrismaClient, BookingStatus, PaymentRecordStatus } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

const CAR_DATA = [
  {
    make: 'Toyota', carModel: 'Camry', year: 2023,
    registrationNumber: 'KA-01-AB-1001', category: 'sedan' as const, dailyRate: 55,
    locationLat: 12.9716, locationLng: 77.5946, locationAddress: 'Bangalore, Karnataka',
    features: ['Bluetooth', 'Backup Camera', 'Cruise Control', 'Apple CarPlay'],
    images: ['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800'],
    averageRating: 4.5, reviewCount: 32,
  },
  {
    make: 'Honda', carModel: 'CR-V', year: 2023,
    registrationNumber: 'KA-01-AB-1002', category: 'suv' as const, dailyRate: 75,
    locationLat: 12.9716, locationLng: 77.5946, locationAddress: 'Bangalore, Karnataka',
    features: ['AWD', 'Sunroof', 'Lane Assist', 'Android Auto'],
    images: ['https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800'],
    averageRating: 4.7, reviewCount: 58,
  },
  {
    make: 'BMW', carModel: '5 Series', year: 2024,
    registrationNumber: 'KA-01-AB-1003', category: 'luxury' as const, dailyRate: 180,
    locationLat: 12.9716, locationLng: 77.5946, locationAddress: 'Bangalore, Karnataka',
    features: ['Leather Seats', 'Harman Kardon Audio', 'Heads-Up Display', 'Ambient Lighting'],
    images: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800'],
    averageRating: 4.9, reviewCount: 14,
  },
  {
    make: 'Tesla', carModel: 'Model 3', year: 2024,
    registrationNumber: 'KA-01-AB-1004', category: 'electric' as const, dailyRate: 120,
    locationLat: 12.9716, locationLng: 77.5946, locationAddress: 'Bangalore, Karnataka',
    features: ['Autopilot', '15" Touchscreen', 'Over-the-Air Updates', 'Zero Emissions'],
    images: ['https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800'],
    averageRating: 4.8, reviewCount: 47,
  },
  {
    make: 'Ford', carModel: 'Mustang', year: 2023,
    registrationNumber: 'KA-01-AB-1005', category: 'sedan' as const, dailyRate: 95,
    locationLat: 12.9716, locationLng: 77.5946, locationAddress: 'Bangalore, Karnataka',
    features: ['V8 Engine', 'Sport Mode', 'Recaro Seats', 'Digital Instrument Cluster'],
    images: ['https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800'],
    averageRating: 4.6, reviewCount: 21,
  },
  {
    make: 'Mercedes-Benz', carModel: 'GLE 450', year: 2024,
    registrationNumber: 'KA-01-AB-1006', category: 'luxury' as const, dailyRate: 220,
    locationLat: 12.9716, locationLng: 77.5946, locationAddress: 'Bangalore, Karnataka',
    features: ['MBUX Infotainment', 'Air Suspension', 'Burmester Audio', '360° Camera'],
    images: ['https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800'],
    averageRating: 4.9, reviewCount: 9,
  },
  {
    make: 'Hyundai', carModel: 'Tucson', year: 2023,
    registrationNumber: 'KA-01-AB-1007', category: 'suv' as const, dailyRate: 65,
    locationLat: 12.9716, locationLng: 77.5946, locationAddress: 'Bangalore, Karnataka',
    features: ['Wireless Charging', 'Smart Cruise Control', 'Panoramic Roof', 'Blind Spot Monitor'],
    images: ['https://images.unsplash.com/photo-1617469767745-f74e8ceafe9a?w=800'],
    averageRating: 4.4, reviewCount: 39,
  },
  {
    make: 'Nissan', carModel: 'Leaf', year: 2024,
    registrationNumber: 'KA-01-AB-1008', category: 'electric' as const, dailyRate: 70,
    locationLat: 12.9716, locationLng: 77.5946, locationAddress: 'Bangalore, Karnataka',
    features: ['ProPILOT Assist', 'e-Pedal', 'Bose Audio', 'DC Fast Charge'],
    images: ['https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800'],
    averageRating: 4.3, reviewCount: 27,
  },
  {
    make: 'Audi', carModel: 'Q7', year: 2024,
    registrationNumber: 'KA-01-AB-1009', category: 'luxury' as const, dailyRate: 200,
    locationLat: 12.9716, locationLng: 77.5946, locationAddress: 'Bangalore, Karnataka',
    features: ['Quattro AWD', 'Virtual Cockpit', 'Bang & Olufsen Audio', 'Night Vision'],
    images: ['https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800'],
    averageRating: 4.8, reviewCount: 11,
  },
  {
    make: 'Kia', carModel: 'Sportage', year: 2023,
    registrationNumber: 'KA-01-AB-1010', category: 'suv' as const, dailyRate: 58,
    locationLat: 12.9716, locationLng: 77.5946, locationAddress: 'Bangalore, Karnataka',
    features: ['Dual Panoramic Display', 'V2L Technology', 'Safe Exit Assist', 'Meridian Sound'],
    images: ['https://images.unsplash.com/photo-1619976215249-1f4b64f9e5f3?w=800'],
    averageRating: 4.5, reviewCount: 43,
  },
  {
    make: 'Volkswagen', carModel: 'Passat', year: 2023,
    registrationNumber: 'KA-01-AB-1011', category: 'sedan' as const, dailyRate: 62,
    locationLat: 12.9716, locationLng: 77.5946, locationAddress: 'Bangalore, Karnataka',
    features: ['Adaptive Cruise Control', 'DCC Suspension', 'Digital Cockpit', 'Park Assist'],
    images: ['https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800'],
    averageRating: 4.2, reviewCount: 18,
  },
  {
    make: 'Chevrolet', carModel: 'Bolt EV', year: 2024,
    registrationNumber: 'KA-01-AB-1012', category: 'electric' as const, dailyRate: 65,
    locationLat: 12.9716, locationLng: 77.5946, locationAddress: 'Bangalore, Karnataka',
    features: ['259mi Range', 'DC Fast Charge', 'One-Pedal Driving', 'Chevy Safety Assist'],
    images: ['https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800'],
    averageRating: 4.1, reviewCount: 22,
  },
];

async function main() {
  const force = process.argv.includes('--force');

  if (force) {
    console.log('🗑️  Clearing existing data...');
    // Order matters — children before parents
    await prisma.review.deleteMany({});
    await prisma.payment.deleteMany({});
    await prisma.booking.deleteMany({});
    await prisma.car.deleteMany({});
    await prisma.user.deleteMany({});
    console.log('✅ Cleared.');
  }

  // ── Users ──────────────────────────────────────────────────────────────────
  const existingUserCount = await prisma.user.count();
  const existingCarCount  = await prisma.car.count();

  if (existingUserCount > 0 && existingCarCount > 0 && !force) {
    console.log(`⚠️  DB already has ${existingUserCount} users and ${existingCarCount} cars. Skipping seed. Use --force to re-seed.`);
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const adminHash = await bcrypt.hash('Admin@1234', salt);
  const userHash  = await bcrypt.hash('User@1234', salt);

  const admin = await prisma.user.create({
    data: {
      firstName: 'Admin', lastName: 'User',
      email: 'admin@rentease.com',
      passwordHash: adminHash,
      role: 'admin',
      phoneNumber:   '9000000001',
      licenseNumber: 'ADMIN-LIC-001',
      licenseStatus: 'verified',
      status:        'active',
    },
  });
  console.log(`✅ Admin created: ${admin.email}`);

  const user1 = await prisma.user.create({
    data: {
      firstName: 'Arjun', lastName: 'Sharma',
      email: 'arjun@demo.com',
      passwordHash: userHash,
      role: 'user',
      phoneNumber:   '9000000002',
      licenseNumber: 'DEMO-LIC-001',
      licenseStatus: 'verified',
      status:        'active',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      firstName: 'Priya', lastName: 'Singh',
      email: 'priya@demo.com',
      passwordHash: userHash,
      role: 'user',
      phoneNumber:   '9000000003',
      licenseNumber: 'DEMO-LIC-002',
      licenseStatus: 'pending',
      status:        'active',
    },
  });
  console.log(`✅ Demo users created: ${user1.email}, ${user2.email}`);

  // ── Cars ───────────────────────────────────────────────────────────────────
  const cars = await Promise.all(
    CAR_DATA.map((c) => prisma.car.create({ data: c }))
  );
  console.log(`✅ ${cars.length} cars seeded.`);

  // ── Sample completed booking + payment + review for user1 ─────────────────
  const car = cars[0]; // Toyota Camry
  const startDate = new Date('2026-06-01');
  const endDate   = new Date('2026-06-04');
  const totalDays = 3;
  const totalAmount = totalDays * Number(car.dailyRate);

  const booking = await prisma.booking.create({
    data: {
      userId:            user1.id,
      carId:             car.id,
      startDate,
      endDate,
      totalDays,
      dailyRateAtBooking: Number(car.dailyRate),
      totalAmount,
      status:        BookingStatus.completed,
      paymentStatus: 'paid',
    },
  });

  await prisma.payment.create({
    data: {
      bookingId:         booking.id,
      userId:            user1.id,
      razorpayOrderId:   'demo_order_seed_001',
      razorpayPaymentId: 'demo_pay_seed_001',
      amount:            totalAmount,
      currency:          'INR',
      status:            PaymentRecordStatus.succeeded,
      paidAt:            new Date('2026-06-01T10:00:00Z'),
    },
  });

  await prisma.review.create({
    data: {
      carId:     car.id,
      userId:    user1.id,
      bookingId: booking.id,
      rating:    5,
      comment:   'Great car, very comfortable ride! Highly recommended.',
    },
  });

  console.log(`✅ Sample booking, payment & review created for ${user1.email}.`);
  console.log('\n🌱 Seed complete!\n');
  console.log('  Admin:     admin@rentease.com / Admin@1234');
  console.log('  Demo User: arjun@demo.com    / User@1234');
  console.log('  Demo User: priya@demo.com    / User@1234');
}

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
