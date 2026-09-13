import { prisma } from '../config/prisma';
import { AppError } from '../middlewares/errorMiddleware';
import { CarStatus } from '@prisma/client';

interface QueryParams {
  page?: number; limit?: number; search?: string;
  category?: string; minPrice?: number; maxPrice?: number; sort?: string;
}

export const carService = {
  // ─── Get All Cars (with filters, pagination, sort) ────────────────────────
  async getAllCars(queryParams: QueryParams) {
    const {
      page = 1, limit = 10, search, category, minPrice, maxPrice, sort,
    } = queryParams;

    const where: any = {
      status: CarStatus.available,
    };

    if (category) where.category = category;

    if (minPrice || maxPrice) {
      where.dailyRate = {};
      if (minPrice) where.dailyRate.gte = Number(minPrice);
      if (maxPrice) where.dailyRate.lte = Number(maxPrice);
    }

    if (search) {
      where.OR = [
        { make:     { contains: search, mode: 'insensitive' } },
        { carModel: { contains: search, mode: 'insensitive' } },
      ];
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'priceAsc')  orderBy = { dailyRate: 'asc' };
    if (sort === 'priceDesc') orderBy = { dailyRate: 'desc' };
    if (sort === 'rating')    orderBy = { averageRating: 'desc' };

    const skip = (Number(page) - 1) * Number(limit);

    const [cars, totalCount] = await Promise.all([
      prisma.car.findMany({ where, orderBy, skip, take: Number(limit) }),
      prisma.car.count({ where }),
    ]);

    return {
      cars,
      pagination: {
        total: totalCount,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(totalCount / Number(limit)),
      },
    };
  },

  // ─── Get Car by ID ────────────────────────────────────────────────────────
  async getCarById(carId: string) {
    const car = await prisma.car.findUnique({ where: { id: carId } });
    if (!car || car.status === 'retired') throw new AppError(404, 'Car not found');
    return car;
  },

  // ─── Create Car ───────────────────────────────────────────────────────────
  async createCar(carData: any, imageUrls: string[]) {
    const location = carData.location || {};
    const [locationLng, locationLat] = location.coordinates || [null, null];

    // Only allow valid initial statuses — never let API set 'rented' or 'retired' on creation
    const allowedStatuses = ['available', 'maintenance'];
    const status = allowedStatuses.includes(carData.status) ? carData.status : 'available';

    return await prisma.car.create({
      data: {
        make:               carData.make,
        carModel:           carData.carModel,
        year:               Number(carData.year),
        registrationNumber: carData.registrationNumber,
        category:           carData.category,
        dailyRate:          Number(carData.dailyRate),
        status,
        locationLat:        locationLat ? Number(locationLat) : null,
        locationLng:        locationLng ? Number(locationLng) : null,
        locationAddress:    location.address || carData.locationAddress || '',
        features:           Array.isArray(carData.features) ? carData.features : [],
        images:             imageUrls,
      },
    });
  },

  // ─── Update Car ───────────────────────────────────────────────────────────
  async updateCar(carId: string, updateData: any) {
    const data: any = { ...updateData };
    // Strip fields that must never be set via API
    delete data.id;
    delete data.createdAt;
    delete data.updatedAt;

    if (updateData.location) {
      const [lng, lat] = updateData.location.coordinates || [null, null];
      data.locationLat     = lat ? Number(lat) : undefined;
      data.locationLng     = lng ? Number(lng) : undefined;
      data.locationAddress = updateData.location.address;
      delete data.location;
    }

    try {
      return await prisma.car.update({ where: { id: carId }, data });
    } catch (e: any) {
      if (e?.code === 'P2025') throw new AppError(404, 'Car not found');
      throw e;
    }
  },

  // ─── Delete Car (soft-delete: mark as retired) ────────────────────────────
  async deleteCar(carId: string) {
    try {
      return await prisma.car.update({ where: { id: carId }, data: { status: CarStatus.retired } });
    } catch (e: any) {
      if (e?.code === 'P2025') throw new AppError(404, 'Car not found');
      throw e;
    }
  },
};
