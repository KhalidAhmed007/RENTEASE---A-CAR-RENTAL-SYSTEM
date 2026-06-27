import mongoose, { Schema, Document } from 'mongoose';

export interface ICar extends Document {
  make: string;
  carModel: string;
  year: number;
  registrationNumber: string;
  category: 'sedan' | 'suv' | 'luxury' | 'electric';
  dailyRate: number;
  status: 'available' | 'maintenance' | 'retired';
  location: {
    type: 'Point';
    coordinates: [number, number];
    address: string;
  };
  features: string[];
  images: string[];
  averageRating: number;
  reviewCount: number;
}

const CarSchema = new Schema<ICar>(
  {
    make: { type: String, required: true, trim: true, index: true },
    carModel: { type: String, required: true, trim: true },
    year: { type: Number, required: true },
    registrationNumber: { type: String, required: true, unique: true },
    category: { type: String, enum: ['sedan', 'suv', 'luxury', 'electric'], required: true, index: true },
    dailyRate: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['available', 'maintenance', 'retired'], default: 'available' },
    location: {
      type: { type: String, enum: ['Point'], required: true },
      coordinates: { type: [Number], required: true },
      address: { type: String, required: true },
    },
    features: [{ type: String }],
    images: [{ type: String }],
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

CarSchema.index({ location: '2dsphere' });
CarSchema.index({ category: 1, dailyRate: 1 });

export default mongoose.model<ICar>('Car', CarSchema);
