// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  avatar?: string;
  createdAt: Date;
  role: 'client' | 'barber';
}

export interface Client extends User {
  role: 'client';
  loyaltyPoints: number;
  totalVisits: number;
  lastVisit?: Date;
  preferredServices: string[];
  notes?: string;
}

export interface Barber extends User {
  role: 'barber';
  bio: string;
  specialties: string[];
  workingHours: WorkingHours;
  isAvailable: boolean;
}

// Service Types
export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  price: number;
  category: ServiceCategory;
  image?: string;
  isActive: boolean;
}

export type ServiceCategory = 
  | 'haircut'
  | 'beard'
  | 'combo'
  | 'specialty'
  | 'kids';

// Booking Types
export interface Booking {
  id: string;
visitorId: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  serviceDuration: number;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  status: BookingStatus;
  notes?: string;
  paymentStatus: PaymentStatus;
  paymentId?: string;
  tipAmount?: number;
  totalPaid?: number;
  createdAt: Date;
  updatedAt: Date;
}

export type BookingStatus = 
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export type PaymentStatus = 
  | 'pending'
  | 'paid'
  | 'refunded'
  | 'failed';

// Time Slot Types
export interface TimeSlot {
  time: string; // HH:MM
  available: boolean;
}

export interface WorkingHours {
  [key: string]: DaySchedule; // 'monday', 'tuesday', etc.
}

export interface DaySchedule {
  isOpen: boolean;
  openTime: string; // HH:MM
  closeTime: string; // HH:MM
  breaks?: Break[];
}

export interface Break {
  startTime: string;
  endTime: string;
}

// Review Types
export interface Review {
  id: string;
  clientId: string;
  clientName: string;
  bookingId: string;
  rating: number; // 1-5
  comment?: string;
  createdAt: Date;
  response?: string;
  responseAt?: Date;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: Date;
}

export type NotificationType = 
  | 'booking_reminder'
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'barber_available'
  | 'holiday_notice'
  | 'promotion'
  | 'loyalty_reward';

// Loyalty Types
export interface LoyaltyReward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  type: 'discount' | 'free_service' | 'upgrade';
  value: number; // percentage or dollar amount
  isActive: boolean;
}

// Payment Types
export interface PaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
  tipAmount: number;
  bookingId: string;
}

