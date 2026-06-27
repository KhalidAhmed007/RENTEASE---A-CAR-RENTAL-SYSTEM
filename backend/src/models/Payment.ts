import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  booking: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  paymentProvider: 'razorpay';
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  paymentMethod?: string;
  paidAt?: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    booking: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    razorpayOrderId: { type: String, unique: true, sparse: true },
    razorpayPaymentId: { type: String, unique: true, sparse: true },
    razorpaySignature: { type: String },
    paymentProvider: { type: String, enum: ['razorpay'], default: 'razorpay' },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: { type: String, enum: ['pending', 'succeeded', 'failed', 'refunded'], default: 'pending' },
    paymentMethod: { type: String },
    paidAt: { type: Date }
  },
  { timestamps: true }
);

// Compound index for user payment history queries (sorted by creation)
PaymentSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model<IPayment>('Payment', PaymentSchema);

