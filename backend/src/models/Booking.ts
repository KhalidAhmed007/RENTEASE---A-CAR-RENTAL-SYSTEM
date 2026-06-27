import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
  user: mongoose.Types.ObjectId;
  car: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  dailyRateAtBooking: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  payment?: mongoose.Types.ObjectId;
  cancellationReason?: string;
}

const BookingSchema = new Schema<IBooking>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    car: { type: Schema.Types.ObjectId, ref: 'Car', required: true, index: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalDays: { type: Number, required: true, min: 1 },
    dailyRateAtBooking: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    status: { 
      type: String, 
      enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled'], 
      default: 'pending' 
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    payment: { type: Schema.Types.ObjectId, ref: 'Payment' },
    cancellationReason: { type: String },
  },
  { timestamps: true }
);

BookingSchema.index({ car: 1, startDate: 1, endDate: 1 });
BookingSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model<IBooking>('Booking', BookingSchema);
