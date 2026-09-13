import { api } from './axios';
import { ApiResponse, RazorpayOrderResponse, Payment } from '@/types';

/** Prisma Decimal fields come back as strings over JSON — coerce them to numbers. */
function normalizePayment(payment: any): Payment {
  if (!payment) return payment;
  return {
    ...payment,
    amount: Number(payment.amount),
    booking: payment.booking ? {
      ...payment.booking,
      totalAmount: Number(payment.booking.totalAmount),
      dailyRateAtBooking: Number(payment.booking.dailyRateAtBooking),
      car: payment.booking.car ? {
        ...payment.booking.car,
        dailyRate: Number(payment.booking.car.dailyRate),
      } : undefined,
    } : undefined,
  };
}

export const paymentApi = {
  createOrder: async (bookingId: string): Promise<RazorpayOrderResponse> => {
    const response = await api.post<ApiResponse<RazorpayOrderResponse>>('/payments/create-order', { bookingId });
    return response.data.data;
  },

  verifyPayment: async (data: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
    const response = await api.post<ApiResponse<{ success: boolean; bookingId: string }>>('/payments/verify', data);
    return response.data;
  },
  
  demoCapture: async (bookingId: string) => {
    const response = await api.post<ApiResponse<{ success: boolean }>>('/payments/demo-capture', { bookingId });
    return response.data;
  },

  getHistory: async (): Promise<Payment[]> => {
    const response = await api.get<ApiResponse<Payment[]>>('/payments/history');
    const data = response.data.data;
    return Array.isArray(data) ? data.map(normalizePayment) : [];
  }
};

