import User from '../models/User';
import bcrypt from 'bcrypt';
import { AppError } from '../middlewares/errorMiddleware';

export const authService = {
  async register(userData: any) {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new AppError(400, 'Email already in use');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(userData.password, salt);

    const newUser = await User.create({
      firstName:     userData.firstName,
      lastName:      userData.lastName,
      email:         userData.email,
      phoneNumber:   userData.phoneNumber,
      licenseNumber: userData.licenseNumber,
      passwordHash,
    });

    return newUser;
  },

  async login(email: string, passwordString: string) {
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      throw new AppError(401, 'Invalid credentials');
    }

    const isMatch = await bcrypt.compare(passwordString, user.passwordHash);
    if (!isMatch) {
      throw new AppError(401, 'Invalid credentials');
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    return user;
  }
};
