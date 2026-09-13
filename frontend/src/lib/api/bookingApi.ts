import { api } from './axios';
import { ApiResponse, Booking, PaginatedBookingsResponse } from '@/types';

export interface CreateBookingPayload {
  carId: string;
  startDate: string;
  endDate: string;
}

/** Prisma Decimal fields come back as strings over JSON — coerce them to numbers. */
function normalizeBooking(booking: any): Booking {
  if (!booking) return booking;
  return {
    ...booking,
    dailyRateAtBooking: Number(booking.dailyRateAtBooking),
    totalAmount: Number(booking.totalAmount),
    car: booking.car ? { ...booking.car, dailyRate: Number(booking.car.dailyRate) } : null,
  };
}

export const bookingApi = {
  createBooking: async (data: CreateBookingPayload) => {
    const response = await api.post<ApiResponse<Booking>>('/bookings', data);
    return {
      ...response.data,
      data: normalizeBooking(response.data.data),
    };
  },

  getMyBookings: async (params?: { page?: number; limit?: number; status?: string }) => {
    const response = await api.get<ApiResponse<PaginatedBookingsResponse>>('/bookings/my-bookings', { params });
    const data = response.data.data;
    return {
      ...data,
      bookings: data.bookings ? data.bookings.map(normalizeBooking) : [],
    };
  },

  getBooking: async (id: string) => {
    const response = await api.get<ApiResponse<Booking>>(`/bookings/${id}`);
    return normalizeBooking(response.data.data);
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

