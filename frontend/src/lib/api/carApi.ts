import { api } from '@/lib/api/axios';
import { ApiResponse, Car, CarFilters, PaginatedCarsResponse } from '@/types';

export const carApi = {
  getCars: async (filters: CarFilters = {}): Promise<PaginatedCarsResponse> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== '') params.set(key, String(val));
    });
    const res = await api.get<ApiResponse<PaginatedCarsResponse>>(`/cars?${params.toString()}`);
    return res.data.data;
  },

  getCarById: async (id: string): Promise<Car> => {
    const res = await api.get<ApiResponse<Car>>(`/cars/${id}`);
    return res.data.data;
  }
};
