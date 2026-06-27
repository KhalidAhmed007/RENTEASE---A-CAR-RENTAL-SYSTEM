export interface Car {
  _id: string;
  make: string;
  carModel: string;
  year: number;
  registrationNumber: string;
  category: 'sedan' | 'suv' | 'luxury' | 'electric';
  dailyRate: number;
  status: 'available' | 'maintenance' | 'retired';
  location: {
    type: 'Point';
    coordinates: [number, number];
    address: string;
  };
  features: string[];
  images: string[];
  averageRating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedCarsResponse {
  cars: Car[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export interface CarFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'priceAsc' | 'priceDesc' | 'newest' | 'rating';
}

export interface Booking {
  _id: string;
  user: string | { _id: string; [key: string]: unknown };
  car: Car | string | { _id: string; make?: string; carModel?: string; [key: string]: unknown };
  startDate: string;
  endDate: string;
  totalDays: number;
  dailyRateAtBooking: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'active' | 'cancelled' | 'completed';
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RazorpayOrderResponse {
  order_id: string;
  amount: number;
  currency: string;
  key: string;
}

export interface PaginatedBookingsResponse {
  bookings: Booking[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
