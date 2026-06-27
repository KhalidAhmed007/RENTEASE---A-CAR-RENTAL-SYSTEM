import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Car from '../src/models/Car';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI as string;

const cars = [
  {
    make: 'Toyota', carModel: 'Camry', year: 2023,
    registrationNumber: 'KA-01-AB-1001',
    category: 'sedan', dailyRate: 55, status: 'available',
    location: { type: 'Point', coordinates: [77.5946, 12.9716], address: 'Bangalore, Karnataka' },
    features: ['Bluetooth', 'Backup Camera', 'Cruise Control', 'Apple CarPlay'],
    images: ['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800'],
    averageRating: 4.5, reviewCount: 32,
  },
  {
    make: 'Honda', carModel: 'CR-V', year: 2023,
    registrationNumber: 'KA-01-AB-1002',
    category: 'suv', dailyRate: 75, status: 'available',
    location: { type: 'Point', coordinates: [77.5946, 12.9716], address: 'Bangalore, Karnataka' },
    features: ['AWD', 'Sunroof', 'Lane Assist', 'Android Auto'],
    images: ['https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800'],
    averageRating: 4.7, reviewCount: 58,
  },
  {
    make: 'BMW', carModel: '5 Series', year: 2024,
    registrationNumber: 'KA-01-AB-1003',
    category: 'luxury', dailyRate: 180, status: 'available',
    location: { type: 'Point', coordinates: [77.5946, 12.9716], address: 'Bangalore, Karnataka' },
    features: ['Leather Seats', 'Harman Kardon Audio', 'Heads-Up Display', 'Ambient Lighting'],
    images: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800'],
    averageRating: 4.9, reviewCount: 14,
  },
  {
    make: 'Tesla', carModel: 'Model 3', year: 2024,
    registrationNumber: 'KA-01-AB-1004',
    category: 'electric', dailyRate: 120, status: 'available',
    location: { type: 'Point', coordinates: [77.5946, 12.9716], address: 'Bangalore, Karnataka' },
    features: ['Autopilot', '15" Touchscreen', 'Over-the-Air Updates', 'Zero Emissions'],
    images: ['https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800'],
    averageRating: 4.8, reviewCount: 47,
  },
  {
    make: 'Ford', carModel: 'Mustang', year: 2023,
    registrationNumber: 'KA-01-AB-1005',
    category: 'sedan', dailyRate: 95, status: 'available',
    location: { type: 'Point', coordinates: [77.5946, 12.9716], address: 'Bangalore, Karnataka' },
    features: ['V8 Engine', 'Sport Mode', 'Recaro Seats', 'Digital Instrument Cluster'],
    images: ['https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800'],
    averageRating: 4.6, reviewCount: 21,
  },
  {
    make: 'Mercedes-Benz', carModel: 'GLE 450', year: 2024,
    registrationNumber: 'KA-01-AB-1006',
    category: 'luxury', dailyRate: 220, status: 'available',
    location: { type: 'Point', coordinates: [77.5946, 12.9716], address: 'Bangalore, Karnataka' },
    features: ['MBUX Infotainment', 'Air Suspension', 'Burmester Audio', '360° Camera'],
    images: ['https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800'],
    averageRating: 4.9, reviewCount: 9,
  },
  {
    make: 'Hyundai', carModel: 'Tucson', year: 2023,
    registrationNumber: 'KA-01-AB-1007',
    category: 'suv', dailyRate: 65, status: 'available',
    location: { type: 'Point', coordinates: [77.5946, 12.9716], address: 'Bangalore, Karnataka' },
    features: ['Wireless Charging', 'Smart Cruise Control', 'Panoramic Roof', 'Blind Spot Monitor'],
    images: ['https://images.unsplash.com/photo-1617469767745-f74e8ceafe9a?w=800'],
    averageRating: 4.4, reviewCount: 39,
  },
  {
    make: 'Nissan', carModel: 'Leaf', year: 2024,
    registrationNumber: 'KA-01-AB-1008',
    category: 'electric', dailyRate: 70, status: 'available',
    location: { type: 'Point', coordinates: [77.5946, 12.9716], address: 'Bangalore, Karnataka' },
    features: ['ProPILOT Assist', 'e-Pedal', 'Bose Audio', 'DC Fast Charge'],
    images: ['https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800'],
    averageRating: 4.3, reviewCount: 27,
  },
  {
    make: 'Audi', carModel: 'Q7', year: 2024,
    registrationNumber: 'KA-01-AB-1009',
    category: 'luxury', dailyRate: 200, status: 'available',
    location: { type: 'Point', coordinates: [77.5946, 12.9716], address: 'Bangalore, Karnataka' },
    features: ['Quattro AWD', 'Virtual Cockpit', 'Bang & Olufsen Audio', 'Night Vision'],
    images: ['https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800'],
    averageRating: 4.8, reviewCount: 11,
  },
  {
    make: 'Kia', carModel: 'Sportage', year: 2023,
    registrationNumber: 'KA-01-AB-1010',
    category: 'suv', dailyRate: 58, status: 'available',
    location: { type: 'Point', coordinates: [77.5946, 12.9716], address: 'Bangalore, Karnataka' },
    features: ['Dual Panoramic Display', 'V2L Technology', 'Safe Exit Assist', 'Meridian Sound'],
    images: ['https://images.unsplash.com/photo-1619976215249-1f4b64f9e5f3?w=800'],
    averageRating: 4.5, reviewCount: 43,
  },
  {
    make: 'Volkswagen', carModel: 'Passat', year: 2023,
    registrationNumber: 'KA-01-AB-1011',
    category: 'sedan', dailyRate: 62, status: 'available',
    location: { type: 'Point', coordinates: [77.5946, 12.9716], address: 'Bangalore, Karnataka' },
    features: ['Adaptive Cruise Control', 'DCC Suspension', 'Digital Cockpit', 'Park Assist'],
    images: ['https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800'],
    averageRating: 4.2, reviewCount: 18,
  },
  {
    make: 'Chevrolet', carModel: 'Bolt EV', year: 2024,
    registrationNumber: 'KA-01-AB-1012',
    category: 'electric', dailyRate: 65, status: 'available',
    location: { type: 'Point', coordinates: [77.5946, 12.9716], address: 'Bangalore, Karnataka' },
    features: ['259mi Range', 'DC Fast Charge', 'One-Pedal Driving', 'Chevy Safety Assist'],
    images: ['https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800'],
    averageRating: 4.1, reviewCount: 22,
  },
];

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected!');

  const existing = await Car.countDocuments();
  if (existing > 0) {
    console.log(`⚠️  Cars collection already has ${existing} documents. Skipping seed.`);
    console.log('   Run with --force to clear and re-seed.');
    if (!process.argv.includes('--force')) {
      await mongoose.disconnect();
      return;
    }
    console.log('🗑️  Clearing existing cars...');
    await Car.deleteMany({});
  }

  console.log(`🌱 Seeding ${cars.length} cars...`);
  await Car.insertMany(cars);
  console.log(`✅ Successfully seeded ${cars.length} cars!`);
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
