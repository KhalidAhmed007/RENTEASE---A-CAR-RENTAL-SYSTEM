import { prisma } from '../config/prisma';
import bcrypt from 'bcrypt';
import { AppError } from '../middlewares/errorMiddleware';

export const userService = {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, firstName: true, lastName: true, email: true,
        role: true, phoneNumber: true, licenseNumber: true,
        licenseStatus: true, status: true, lastLogin: true,
        createdAt: true, updatedAt: true,
        // passwordHash is intentionally excluded
      },
    });
    if (!user) throw new AppError(404, 'User not found');
    return user;
  },

  async updateProfile(userId: string, updateData: any) {
    // Explicit whitelist — only these fields may be updated via this endpoint.
    const allowed: Array<'firstName' | 'lastName' | 'phoneNumber' | 'licenseNumber'> =
      ['firstName', 'lastName', 'phoneNumber', 'licenseNumber'];
    const safeData = Object.fromEntries(
      allowed
        .filter((k) => updateData[k] !== undefined)
        .map((k) => [k, updateData[k]])
    );

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data:  safeData,
      select: {
        id: true, firstName: true, lastName: true, email: true,
        role: true, phoneNumber: true, licenseNumber: true,
        licenseStatus: true, status: true, lastLogin: true,
        createdAt: true, updatedAt: true,
      },
    }).catch(() => null);

    if (!updatedUser) throw new AppError(404, 'User not found');
    return updatedUser;
  },

  async updatePassword(userId: string, currentPasswordString: string, newPasswordString: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError(404, 'User not found');

    const isMatch = await bcrypt.compare(currentPasswordString, user.passwordHash);
    if (!isMatch) throw new AppError(400, 'Current password is incorrect');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPasswordString, salt);

    await prisma.user.update({
      where: { id: userId },
      data:  { passwordHash },
    });
  },

  async getUserBookings(userId: string, page: number = 1, limit: number = 10, statusFilter?: string) {
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (statusFilter) where.status = statusFilter;

    const [bookings, totalCount] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          car: {
            select: { id: true, make: true, carModel: true, year: true, images: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ]);

    return {
      bookings,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  },
};
