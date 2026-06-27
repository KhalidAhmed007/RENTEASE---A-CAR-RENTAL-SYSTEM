import { api } from './axios';
import { ApiResponse, Booking, PaginatedBookingsResponse } from '@/types';

export interface CreateBookingPayload {
  carId: string;
  startDate: string;
  endDate: string;
}

export const bookingApi = {
  createBooking: async (data: CreateBookingPayload) => {
    const response = await api.post<ApiResponse<Booking>>('/bookings', data);
    return response.data;
  },

  getMyBookings: async (params?: { page?: number; limit?: number; status?: string }) => {
    const response = await api.get<ApiResponse<PaginatedBookingsResponse>>('/bookings/my-bookings', { params });
    return response.data.data;
  },

  getBooking: async (id: string) => {
    const response = await api.get<ApiResponse<Booking>>(`/bookings/${id}`);
    return response.data.data;
  },

  cancelBooking: async (id: string) => {
    const response = await api.post<ApiResponse<Booking>>(`/bookings/${id}/cancel`);
    return response.data;
  },

  clearBookingHistory: async () => {
    const response = await api.delete<ApiResponse<any>>('/bookings/history');
    return response.data;
  }
};
