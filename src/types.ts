export type Role = 'customer' | 'vendor' | 'admin';

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  userId: string;
  role: Role;
  email: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  name: string;
  phone: string;
  role: Role;
}

export interface VendorRegistrationPayload {
  businessName: string;
  experience: number;
  rating: number;
  responseRate: number;
  verified: boolean;
  description: string;
  services: string[];
  specializations: string[];
  cities: string[];
  travelRadius: number;
  priceMin: number;
  priceMax: number;
  portfolio?: string[];
  availableDates?: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  createdAt: string;
}

export type EventType = 'wedding' | 'birthday' | 'engagement' | 'corporate_event' | 'baby_shower' | 'reception';

export interface RequirementForm {
  eventType: EventType;
  city: string;
  budget: number;
  guestCount: number;
  theme: string;
  eventDate: string;
  specialNotes: string;
}

export interface Requirement extends RequirementForm {
  id: string;
  userId: string;
  status: string;
}

export interface Match {
  requirementId: string;
  vendorId: string;
  score: number;
  rank: number;
  matchedByAI: boolean;
  reason: string;
}

export interface Vendor {
  id: string;
  userId: string;
  businessName: string;
  experience: number;
  rating: number;
  responseRate: number;
  verified: boolean;
  status: string;
  description: string;
  services: string[];
  specializations: string[];
  cities: string[];
  priceMin: number;
  priceMax: number;
  availableDates: string[];
}

export interface RequirementInsights {
  eventType: EventType;
  city: string;
  budget: number;
  guestCount: number;
  theme: string;
  eventDate: string;
  suggestedServices: string[];
  notes: string[];
}

export interface Invitation {
  id: string;
  vendorId: string;
  requirementId: string;
  status: string;
  sentAt: string;
  respondedAt: string | null;
}

export interface Booking {
  id: string;
  vendorId: string;
  userId: string;
  requirementId: string;
  amount: number;
  paymentMethod?: string;
  billingName?: string;
  billingEmail?: string;
  billingPhone?: string;
  paymentStatus: string;
  bookingStatus: string;
}

export interface CreateBookingPayload {
  vendorId: string;
  userId: string;
  requirementId: string;
  amount: number;
  paymentMethod: string;
  billingName: string;
  billingEmail: string;
  billingPhone: string;
}

export interface Review {
  id: string;
  bookingId: string;
  userId: string;
  vendorId: string;
  rating: number;
  review?: string;
}

export interface AdminDashboard {
  totalUsers: number;
  totalVendors: number;
  activeRequirements: number;
  invitationsSentToday: number;
  aiAcceptanceRate: number;
}
