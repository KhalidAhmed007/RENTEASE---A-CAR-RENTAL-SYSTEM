export interface Car {
  id: string;
  make: string;
  carModel: string;
  year: number;
  registrationNumber: string;
  category: 'sedan' | 'suv' | 'luxury' | 'electric';
  dailyRate: number;
  /** Matches the CarStatus enum: available | rented | maintenance | retired */
  status: 'available' | 'rented' | 'maintenance' | 'retired';
  locationAddress: string;
  locationLat: number | null;
  locationLng: number | null;
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
  id: string;
  userId: string;
  carId: string;
  car: Car | null;
  startDate: string;
  endDate: string;
  totalDays: number;
  dailyRateAtBooking: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'active' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  cancellationReason?: string;
  payment?: {
    id: string;
    status: string;
    amount: number;
  } | null;
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

export interface Payment {
  id: string;
  bookingId: string;
  userId: string;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  razorpaySignature: string | null;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  booking?: {
    id: string;
    startDate: string;
    endDate: string;
    totalAmount: number;
    totalDays: number;
    status: string;
    paymentStatus: string;
    car?: Car | null;
  };
}

/** Shape returned by analyticsService.getCarUtilization() */
export interface CarUtilizationItem {
  category: string;
  totalBookedDays: number;
  revenueGenerated: number;
}

