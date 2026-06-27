import mongoose from 'mongoose';
import Car from './src/models/Car';
import { env } from './src/config/env';
import logger from './src/utils/logger';

/**
 * SEED FILE — Car Rental System
 * ─────────────────────────────────────────────────────────────────────────────
 * Images are served locally from frontend/public/images/cars/
 * All images downloaded from Wikimedia Commons (CC-licensed) or AI-generated.
 *
 * Run:  npx ts-node seedCars.ts
 */

const ATLAS_OPTIONS: mongoose.ConnectOptions = {
  serverSelectionTimeoutMS: 15000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 15000,
  family: 4,
};

// Base URL for locally served images (Next.js public folder)
const IMG = (name: string) => `/images/cars/${name}`;

const sampleCars = [
  // ── SUVs ─────────────────────────────────────────────────────────────────
  {
    make: 'Toyota',
    carModel: 'Fortuner',
    year: 2023,
    registrationNumber: 'KA-01-AB-1234',
    category: 'suv',
    dailyRate: 5500,
    status: 'available',
    location: { type: 'Point', coordinates: [77.5946, 12.9716], address: 'MG Road, Bangalore' },
    features: ['Automatic', '7 Seater', 'Diesel', 'Sunroof'],
    images: [IMG('toyota-fortuner.jpg')],
    averageRating: 4.8,
    reviewCount: 42,
  },
  {
    make: 'Hyundai',
    carModel: 'Creta',
    year: 2024,
    registrationNumber: 'MH-02-XY-5678',
    category: 'suv',
    dailyRate: 3200,
    status: 'available',
    location: { type: 'Point', coordinates: [72.8777, 19.0760], address: 'Andheri West, Mumbai' },
    features: ['Automatic', '5 Seater', 'Petrol', 'Panoramic Sunroof'],
    images: [IMG('hyundai-creta.jpg')],
    averageRating: 4.6,
    reviewCount: 128,
  },
  {
    make: 'Kia',
    carModel: 'Seltos',
    year: 2024,
    registrationNumber: 'TS-09-PQ-3456',
    category: 'suv',
    dailyRate: 3500,
    status: 'available',
    location: { type: 'Point', coordinates: [78.4867, 17.3850], address: 'Banjara Hills, Hyderabad' },
    features: ['Automatic', '5 Seater', 'Diesel', 'Bose Speakers'],
    images: [IMG('kia-seltos.jpg')],
    averageRating: 4.5,
    reviewCount: 64,
  },
  {
    make: 'Mahindra',
    carModel: 'XUV700',
    year: 2024,
    registrationNumber: 'TN-01-AB-1111',
    category: 'suv',
    dailyRate: 4200,
    status: 'available',
    location: { type: 'Point', coordinates: [80.2707, 13.0827], address: 'T Nagar, Chennai' },
    features: ['Automatic', '7 Seater', 'Diesel', 'ADAS', 'Panoramic Sunroof'],
    images: [IMG('mahindra-xuv700.jpg')],
    averageRating: 4.8,
    reviewCount: 156,
  },
  {
    make: 'Jeep',
    carModel: 'Compass',
    year: 2023,
    registrationNumber: 'TS-07-MN-7777',
    category: 'suv',
    dailyRate: 4800,
    status: 'available',
    location: { type: 'Point', coordinates: [78.4867, 17.3850], address: 'Jubilee Hills, Hyderabad' },
    features: ['Automatic', '5 Seater', 'Diesel', '4x4', 'Sunroof'],
    images: [IMG('jeep-compass.jpg')],
    averageRating: 4.6,
    reviewCount: 112,
  },
  {
    make: 'Skoda',
    carModel: 'Kushaq',
    year: 2023,
    registrationNumber: 'KA-51-ST-1010',
    category: 'suv',
    dailyRate: 3400,
    status: 'available',
    location: { type: 'Point', coordinates: [77.5946, 12.9716], address: 'Whitefield, Bangalore' },
    features: ['Manual', '5 Seater', 'Petrol', 'Ventilated Seats'],
    images: [IMG('skoda-kushaq.jpg')],
    averageRating: 4.5,
    reviewCount: 82,
  },
  {
    make: 'MG',
    carModel: 'Hector',
    year: 2024,
    registrationNumber: 'UP-32-YZ-4040',
    category: 'suv',
    dailyRate: 3800,
    status: 'available',
    location: { type: 'Point', coordinates: [80.9462, 26.8467], address: 'Gomti Nagar, Lucknow' },
    features: ['Automatic', '5 Seater', 'Petrol', 'Connected Car Tech'],
    images: [IMG('mg-hector.jpg')],
    averageRating: 4.4,
    reviewCount: 98,
  },
  {
    make: 'Mahindra',
    carModel: 'Thar',
    year: 2024,
    registrationNumber: 'MH-03-TR-9999',
    category: 'suv',
    dailyRate: 3800,
    status: 'available',
    location: { type: 'Point', coordinates: [72.8777, 19.0760], address: 'Bandra West, Mumbai' },
    features: ['Automatic', '4 Seater', 'Diesel', '4x4', 'Convertible'],
    images: [IMG('mahindra-thar.jpg')],
    averageRating: 4.7,
    reviewCount: 65,
  },

  // ── Sedans ────────────────────────────────────────────────────────────────
  {
    make: 'Honda',
    carModel: 'City',
    year: 2023,
    registrationNumber: 'DL-01-YZ-9012',
    category: 'sedan',
    dailyRate: 2800,
    status: 'available',
    location: { type: 'Point', coordinates: [77.2090, 28.6139], address: 'Connaught Place, Delhi' },
    features: ['Manual', '5 Seater', 'Petrol', 'Cruise Control'],
    images: [IMG('honda-city.jpg')],
    averageRating: 4.7,
    reviewCount: 89,
  },
  {
    make: 'Maruti Suzuki',
    carModel: 'Swift',
    year: 2024,
    registrationNumber: 'WB-02-GH-4444',
    category: 'sedan',
    dailyRate: 1600,
    status: 'available',
    location: { type: 'Point', coordinates: [88.3639, 22.5726], address: 'Park Street, Kolkata' },
    features: ['Manual', '5 Seater', 'Petrol', 'High Mileage'],
    images: [IMG('maruti-swift.jpg')],
    averageRating: 4.4,
    reviewCount: 320,
  },
  {
    make: 'Volkswagen',
    carModel: 'Virtus',
    year: 2024,
    registrationNumber: 'MH-12-OP-8888',
    category: 'sedan',
    dailyRate: 3000,
    status: 'available',
    location: { type: 'Point', coordinates: [73.8567, 18.5204], address: 'Koregaon Park, Pune' },
    features: ['Automatic', '5 Seater', 'Petrol', 'Turbo Engine'],
    images: [IMG('volkswagen-virtus.jpg')],
    averageRating: 4.7,
    reviewCount: 76,
  },
  {
    make: 'Honda',
    carModel: 'Amaze',
    year: 2023,
    registrationNumber: 'RJ-14-AB-5050',
    category: 'sedan',
    dailyRate: 2000,
    status: 'available',
    location: { type: 'Point', coordinates: [75.7873, 26.9124], address: 'Malviya Nagar, Jaipur' },
    features: ['Manual', '5 Seater', 'Petrol', 'Spacious Boot'],
    images: [IMG('honda-amaze.jpg')],
    averageRating: 4.3,
    reviewCount: 145,
  },
  {
    make: 'Skoda',
    carModel: 'Slavia',
    year: 2024,
    registrationNumber: 'MH-12-SS-7777',
    category: 'sedan',
    dailyRate: 2600,
    status: 'available',
    location: { type: 'Point', coordinates: [73.8567, 18.5204], address: 'Aundh, Pune' },
    features: ['Automatic', '5 Seater', 'Petrol', 'Sunroof', 'Ventilated Seats'],
    images: [IMG('skoda-slavia.jpg')],
    averageRating: 4.6,
    reviewCount: 39,
  },

  // ── Luxury ────────────────────────────────────────────────────────────────
  {
    make: 'BMW',
    carModel: 'X1',
    year: 2023,
    registrationNumber: 'KA-03-MN-7890',
    category: 'luxury',
    dailyRate: 8500,
    status: 'available',
    location: { type: 'Point', coordinates: [77.6411, 12.9718], address: 'Indiranagar, Bangalore' },
    features: ['Automatic', '5 Seater', 'Petrol', 'Premium Audio', 'Leather Seats'],
    images: [IMG('bmw-x1.jpg')],
    averageRating: 4.9,
    reviewCount: 210,
  },
  {
    make: 'Mercedes-Benz',
    carModel: 'C-Class',
    year: 2023,
    registrationNumber: 'MH-01-EF-3333',
    category: 'luxury',
    dailyRate: 11000,
    status: 'available',
    location: { type: 'Point', coordinates: [72.8258, 18.9220], address: 'Colaba, Mumbai' },
    features: ['Automatic', '5 Seater', 'Petrol', 'Ambient Lighting'],
    images: [IMG('mercedes-c-class.jpg')],
    averageRating: 4.9,
    reviewCount: 54,
  },
  {
    make: 'Toyota',
    carModel: 'Camry',
    year: 2023,
    registrationNumber: 'KA-05-IJ-5555',
    category: 'luxury',
    dailyRate: 7500,
    status: 'available',
    location: { type: 'Point', coordinates: [77.5946, 12.9716], address: 'Jayanagar, Bangalore' },
    features: ['Automatic', '5 Seater', 'Hybrid', 'Ventilated Seats'],
    images: [IMG('toyota-camry.jpg')],
    averageRating: 4.8,
    reviewCount: 95,
  },
  {
    make: 'Audi',
    carModel: 'A6',
    year: 2023,
    registrationNumber: 'HR-26-QR-9999',
    category: 'luxury',
    dailyRate: 13000,
    status: 'available',
    location: { type: 'Point', coordinates: [77.0266, 28.4595], address: 'Cyber City, Gurgaon' },
    features: ['Automatic', '5 Seater', 'Petrol', 'Matrix LED', 'Quattro'],
    images: [IMG('audi-a6.jpg')],
    averageRating: 4.9,
    reviewCount: 38,
  },
  {
    make: 'Volvo',
    carModel: 'XC90',
    year: 2023,
    registrationNumber: 'DL-09-WX-3030',
    category: 'luxury',
    dailyRate: 16000,
    status: 'available',
    location: { type: 'Point', coordinates: [77.2090, 28.6139], address: 'South Extension, Delhi' },
    features: ['Automatic', '7 Seater', 'Hybrid', 'Bowers & Wilkins', 'AWD'],
    images: [IMG('volvo-xc90.jpg')],
    averageRating: 4.8,
    reviewCount: 65,
  },
  {
    make: 'Audi',
    carModel: 'A8 L',
    year: 2024,
    registrationNumber: 'DL-01-AL-8888',
    category: 'luxury',
    dailyRate: 22000,
    status: 'available',
    location: { type: 'Point', coordinates: [77.2090, 28.6139], address: 'Chanakyapuri, Delhi' },
    features: ['Automatic', '5 Seater', 'Petrol', 'Executive Seats', 'Massager'],
    images: [IMG('audi-a8.jpg')],
    averageRating: 5.0,
    reviewCount: 18,
  },

  // ── Electric ─────────────────────────────────────────────────────────────
  {
    make: 'Tesla',
    carModel: 'Model 3',
    year: 2024,
    registrationNumber: 'MH-04-UV-2020',
    category: 'electric',
    dailyRate: 10000,
    status: 'available',
    location: { type: 'Point', coordinates: [72.8777, 19.0760], address: 'Bandra, Mumbai' },
    features: ['Automatic', '5 Seater', 'Electric', 'Autopilot'],
    images: [IMG('tesla-model3.jpg')],
    averageRating: 4.9,
    reviewCount: 150,
  },
  {
    make: 'Tata',
    carModel: 'Nexon EV',
    year: 2023,
    registrationNumber: 'GJ-01-CD-2222',
    category: 'electric',
    dailyRate: 2800,
    status: 'available',
    location: { type: 'Point', coordinates: [72.5714, 23.0225], address: 'SG Highway, Ahmedabad' },
    features: ['Automatic', '5 Seater', 'Electric', 'Fast Charging'],
    images: [IMG('tata-nexon-ev.jpg')],
    averageRating: 4.6,
    reviewCount: 88,
  },
  {
    make: 'Hyundai',
    carModel: 'Ioniq 5',
    year: 2024,
    registrationNumber: 'DL-03-KL-6666',
    category: 'electric',
    dailyRate: 8000,
    status: 'available',
    location: { type: 'Point', coordinates: [77.2090, 28.6139], address: 'Vasant Vihar, Delhi' },
    features: ['Automatic', '5 Seater', 'Electric', 'V2L', 'AWD'],
    images: [IMG('hyundai-ioniq5.jpg')],
    averageRating: 4.9,
    reviewCount: 45,
  },
  {
    make: 'Kia',
    carModel: 'EV6',
    year: 2024,
    registrationNumber: 'KL-01-CD-6060',
    category: 'electric',
    dailyRate: 10500,
    status: 'available',
    location: { type: 'Point', coordinates: [76.9366, 8.5241], address: 'Kowdiar, Trivandrum' },
    features: ['Automatic', '5 Seater', 'Electric', 'AWD', 'Meridian Audio'],
    images: [IMG('kia-ev6.jpg')],
    averageRating: 4.9,
    reviewCount: 52,
  },
  {
    make: 'BYD',
    carModel: 'Atto 3',
    year: 2024,
    registrationNumber: 'KA-03-BY-8888',
    category: 'electric',
    dailyRate: 5800,
    status: 'available',
    location: { type: 'Point', coordinates: [77.6411, 12.9718], address: 'Indiranagar, Bangalore' },
    features: ['Automatic', '5 Seater', 'Electric', 'Panoramic Sunroof', 'V2L'],
    images: [IMG('byd-atto3.jpg')],
    averageRating: 4.8,
    reviewCount: 24,
  },
];

const seedCars = async () => {
  try {
    const uri = env.mongoUri.replace(/:([^@]+)@/, ':****@');
    logger.info(`Connecting to: ${uri}`);
    await mongoose.connect(env.mongoUri, ATLAS_OPTIONS);
    logger.info('Connected to MongoDB');

    let inserted = 0;
    let updated = 0;

    for (const car of sampleCars) {
      const result = await Car.findOneAndUpdate(
        { registrationNumber: car.registrationNumber },
        { $set: car },
        { upsert: true, new: true, runValidators: true }
      );
      if (result) {
        const r = result as any;
        const wasInserted =
          r.createdAt &&
          r.updatedAt &&
          Math.abs(r.createdAt.getTime() - r.updatedAt.getTime()) < 1000;
        if (wasInserted) inserted++;
        else updated++;
      }
    }

    logger.info(`Seed complete — ${inserted} inserted, ${updated} updated (${sampleCars.length} total)`);
    process.exit(0);
  } catch (error) {
    logger.error('Error seeding cars:', error);
    process.exit(1);
  }
};

seedCars();
