import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  role: 'user' | 'admin';
  phoneNumber: string;
  licenseNumber: string;
  licenseStatus: 'pending' | 'verified' | 'rejected';
  status: 'active' | 'suspended';
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true, trim: true, maxlength: 50 },
    lastName: { type: String, required: true, trim: true, maxlength: 50 },
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true, 
      index: true
    },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    phoneNumber: { type: String, required: true, unique: true },
    licenseNumber: { type: String, required: true, unique: true },
    licenseStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);
