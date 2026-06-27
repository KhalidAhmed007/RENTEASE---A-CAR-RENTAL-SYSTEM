import Car from '../models/Car';
import { AppError } from '../middlewares/errorMiddleware';

interface QueryParams {
  page?: number; limit?: number; search?: string;
  category?: string; minPrice?: number; maxPrice?: number; sort?: string;
}

export const carService = {
  async getAllCars(queryParams: QueryParams) {
    const { 
      page = 1, limit = 10, search, category, minPrice, maxPrice, sort 
    } = queryParams;

    const query: any = { status: { $ne: 'retired' } };

    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.dailyRate = {};
      if (minPrice) query.dailyRate.$gte = Number(minPrice);
      if (maxPrice) query.dailyRate.$lte = Number(maxPrice);
    }

    if (search) {
      query.$or = [
        { make: { $regex: search, $options: 'i' } },
        { carModel: { $regex: search, $options: 'i' } }
      ];
    }

    let sortObj: any = { createdAt: -1 };
    if (sort === 'priceAsc') sortObj = { dailyRate: 1 };
    if (sort === 'priceDesc') sortObj = { dailyRate: -1 };
    if (sort === 'rating') sortObj = { averageRating: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const [cars, totalCount] = await Promise.all([
      Car.find(query).sort(sortObj).skip(skip).limit(Number(limit)).lean(),
      Car.countDocuments(query)
    ]);

    return {
      cars,
      pagination: { total: totalCount, page: Number(page), limit: Number(limit), totalPages: Math.ceil(totalCount / Number(limit)) }
    };
  },

  async getCarById(carId: string) {
    const car = await Car.findById(carId).lean();
    if (!car || car.status === 'retired') throw new AppError(404, 'Car not found');
    return car;
  },

  async createCar(carData: any, imageUrls: string[]) {
    carData.images = imageUrls;
    return await Car.create(carData);
  },

  async updateCar(carId: string, updateData: any) {
    const car = await Car.findByIdAndUpdate(carId, updateData, { new: true, runValidators: true });
    if (!car) throw new AppError(404, 'Car not found');
    return car;
  },

  async deleteCar(carId: string) {
    const car = await Car.findByIdAndUpdate(carId, { status: 'retired' }, { new: true });
    if (!car) throw new AppError(404, 'Car not found');
    return car;
  }
};
