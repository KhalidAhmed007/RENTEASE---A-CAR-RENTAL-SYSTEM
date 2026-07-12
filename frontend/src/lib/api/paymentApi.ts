import { api } from './axios';
import { ApiResponse, RazorpayOrderResponse } from '@/types';

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

  getHistory: async () => {
    const response = await api.get<ApiResponse<unknown[]>>('/payments/history');
    return response.data.data;
  }
};
