import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  car: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  booking: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
}

const ReviewSchema = new Schema<IReview>(
  {
    car: { type: Schema.Types.ObjectId, ref: 'Car', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    booking: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

ReviewSchema.index({ car: 1, createdAt: -1 });

export default mongoose.model<IReview>('Review', ReviewSchema);
