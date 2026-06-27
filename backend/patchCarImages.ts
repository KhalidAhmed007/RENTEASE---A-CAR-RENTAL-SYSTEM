/**
 * patchCarImages.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * SAFE image patch — updates ONLY the `images` field on existing car documents
 * by matching on `registrationNumber`. Does NOT delete or re-insert any car.
 * Does NOT break any existing Booking references.
 *
 * Run:  npx ts-node patchCarImages.ts
 */

import mongoose from 'mongoose';
import Car from './src/models/Car';
import { env } from './src/config/env';
import logger from './src/utils/logger';

const ATLAS_OPTIONS: mongoose.ConnectOptions = {
  serverSelectionTimeoutMS: 15000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 15000,
  family: 4,
};

/**
 * Map: registrationNumber → verified working Unsplash image URL
 *
 * All URLs verified June 2026. Format:
 *   https://images.unsplash.com/photo-{ID}?q=80&w=2000&auto=format&fit=crop
 */
const IMAGE_PATCHES: Record<string, string> = {
  // ── SUVs ─────────────────────────────────────────────────────────────────
  // Toyota Fortuner — large Toyota SUV on highway
  'KA-01-AB-1234': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=2000&auto=format&fit=crop',
  // Hyundai Creta — compact SUV front 3/4 view
  'MH-02-XY-5678': 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fd?q=80&w=2000&auto=format&fit=crop',
  // Kia Seltos — dark blue compact SUV
  'TS-09-PQ-3456': 'https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=2000&auto=format&fit=crop',
  // Mahindra XUV700 — large 7-seater SUV
  'TN-01-AB-1111': 'https://images.unsplash.com/photo-1551522435-a13afa10f103?q=80&w=2000&auto=format&fit=crop',
  // Jeep Compass — Jeep SUV on rocky terrain
  'TS-07-MN-7777': 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?q=80&w=2000&auto=format&fit=crop',
  // Skoda Kushaq — silver compact SUV
  'KA-51-ST-1010': 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?q=80&w=2000&auto=format&fit=crop',
  // MG Hector — dark SUV on city road
  'UP-32-YZ-4040': 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=2000&auto=format&fit=crop',
  // Mahindra Thar - Red rugged SUV
  'MH-03-TR-9999': 'https://images.unsplash.com/photo-1626245949168-ca582888f4e2?q=80&w=2000&auto=format&fit=crop',

  // ── Sedans ────────────────────────────────────────────────────────────────
  // Honda City — white sedan on street
  'DL-01-YZ-9012': 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2000&auto=format&fit=crop',
  // Maruti Suzuki Swift — red compact hatchback
  'WB-02-GH-4444': 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=2000&auto=format&fit=crop',
  // Volkswagen Virtus — silver VW sedan
  'MH-12-OP-8888': 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?q=80&w=2000&auto=format&fit=crop',
  // Honda Amaze — white compact sedan
  'RJ-14-AB-5050': 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2000&auto=format&fit=crop',
  // Skoda Slavia - grey premium sedan
  'MH-12-SS-7777': 'https://images.unsplash.com/photo-1605558230459-7b124b23412a?q=80&w=2000&auto=format&fit=crop',

  // ── Luxury ────────────────────────────────────────────────────────────────
  // BMW X1 — BMW with kidney grille
  'KA-03-MN-7890': 'https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=2000&auto=format&fit=crop',
  // Mercedes-Benz C-Class — silver Merc on road
  'MH-01-EF-3333': 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=2000&auto=format&fit=crop',
  // Toyota Camry — elegant white sedan
  'KA-05-IJ-5555': 'https://images.unsplash.com/photo-1621135802920-133df287f89c?q=80&w=2000&auto=format&fit=crop',
  // Audi A6 — grey Audi on highway
  'HR-26-QR-9999': 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=2000&auto=format&fit=crop',
  // Volvo XC90 — white Volvo luxury SUV
  'DL-09-WX-3030': 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?q=80&w=2000&auto=format&fit=crop',
  // Audi A8 L - premium black luxury audi sedan
  'DL-01-AL-8888': 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?q=80&w=2000&auto=format&fit=crop',

  // ── Electric ─────────────────────────────────────────────────────────────
  // Tesla Model 3 — white Tesla on mountain road
  'MH-04-UV-2020': 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=2000&auto=format&fit=crop',
  // Tata Nexon EV — blue EV with charging port
  'GJ-01-CD-2222': 'https://images.unsplash.com/photo-1611173997236-cb7e42e997c2?q=80&w=2000&auto=format&fit=crop',
  // Hyundai Ioniq 5 — white futuristic EV
  'DL-03-KL-6666': 'https://images.unsplash.com/photo-1626072778346-0ab6604d39c4?q=80&w=2000&auto=format&fit=crop',
  // Kia EV6 — sleek EV on open road
  'KL-01-CD-6060': 'https://images.unsplash.com/photo-1650369175478-fb5fd0b6e019?q=80&w=2000&auto=format&fit=crop',
  // BYD Atto 3 - blue BYD electric SUV
  'KA-03-BY-8888': 'https://images.unsplash.com/photo-1695668389947-f703597d3f28?q=80&w=2000&auto=format&fit=crop',
};

const patchImages = async () => {
  try {
    const uri = env.mongoUri.replace(/:([^@]+)@/, ':****@');
    logger.info(`Connecting to MongoDB: ${uri}`);
    await mongoose.connect(env.mongoUri, ATLAS_OPTIONS);
    logger.info('Connected to MongoDB');

    let patchedCount = 0;
    let notFoundCount = 0;
    const errors: string[] = [];

    for (const [regNum, imageUrl] of Object.entries(IMAGE_PATCHES)) {
      try {
        const result = await Car.findOneAndUpdate(
          { registrationNumber: regNum },
          { $set: { images: [imageUrl] } },
          { new: true }
        );

        if (result) {
          logger.info(`✓ Patched: ${result.make} ${result.carModel} (${regNum})`);
          patchedCount++;
        } else {
          logger.warn(`✗ Not found in DB: ${regNum}`);
          notFoundCount++;
        }
      } catch (err) {
        const msg = `Failed to patch ${regNum}: ${(err as Error).message}`;
        logger.error(msg);
        errors.push(msg);
      }
    }

    logger.info('─────────────────────────────────────');
    logger.info(`Patch complete:`);
    logger.info(`  ✓ Patched:    ${patchedCount}`);
    logger.info(`  ✗ Not found:  ${notFoundCount}`);
    logger.info(`  ✗ Errors:     ${errors.length}`);
    if (errors.length > 0) {
      logger.error('Errors:', errors);
    }

    process.exit(errors.length > 0 ? 1 : 0);
  } catch (error) {
    logger.error('Fatal error:', error);
    process.exit(1);
  }
};

patchImages();
