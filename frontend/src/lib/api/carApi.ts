import { api } from '@/lib/api/axios';
import { ApiResponse, Car, CarFilters, PaginatedCarsResponse } from '@/types';

/** Prisma Decimal fields come back as strings over JSON — coerce them to numbers. */
function normalizeCar(car: Car): Car {
  return { ...car, dailyRate: Number(car.dailyRate) };
}

export const carApi = {
  getCars: async (filters: CarFilters = {}): Promise<PaginatedCarsResponse> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== '') params.set(key, String(val));
    });
    const res = await api.get<ApiResponse<PaginatedCarsResponse>>(`/cars?${params.toString()}`);
    const data = res.data.data;
    return { ...data, cars: data.cars.map(normalizeCar) };
  },

  getCarById: async (id: string): Promise<Car> => {
    const res = await api.get<ApiResponse<Car>>(`/cars/${id}`);
    return normalizeCar(res.data.data);
  }
};
