import bcrypt from 'bcrypt';
import { prisma } from '../config/prisma';
import { AppError } from '../middlewares/errorMiddleware';

export const authService = {
  async register(userData: any) {
    const email         = userData.email?.toLowerCase()?.trim();
    const phoneNumber   = userData.phoneNumber?.trim();
    const licenseNumber = userData.licenseNumber?.trim();

    // Check for existing user (email / phone / license)
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { phoneNumber }, { licenseNumber }] },
    });

    if (existing) {
      if (existing.email === email)
        throw new AppError(400, 'An account with this email already exists.');
      if (existing.phoneNumber === phoneNumber)
        throw new AppError(400, 'An account with this phone number already exists.');
      if (existing.licenseNumber === licenseNumber)
        throw new AppError(400, 'An account with this license number already exists.');
    }

    const passwordHash = await bcrypt.hash(userData.password, 10);

    const newUser = await prisma.user.create({
      data: {
        firstName:     userData.firstName.trim(),
        lastName:      userData.lastName.trim(),
        email,
        phoneNumber,
        licenseNumber,
        passwordHash,
      },
    });

    return newUser;
  },

  async login(email: string, passwordString: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) throw new AppError(401, 'Invalid credentials');
    if (user.status === 'suspended') throw new AppError(403, 'Your account has been suspended. Contact support.');

    const isMatch = await bcrypt.compare(passwordString, user.passwordHash);
    if (!isMatch) throw new AppError(401, 'Invalid credentials');

    // Update lastLogin — fire-and-forget, don't block login response
    prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } }).catch(() => {});

    return user;
  },
};
