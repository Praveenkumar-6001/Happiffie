import type {
  AdminDashboard,
  AuthSession,
  Booking,
  CreateBookingPayload,
  CustomerProfilePayload,
  Invitation,
  LoginPayload,
  Match,
  RegisterPayload,
  Requirement,
  RequirementForm,
  RequirementInsights,
  Review,
  User,
  Vendor,
  VendorRegistrationPayload,
  VendorWork,
  VendorWorkPayload,
} from './types';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001/api/v1';
const SESSION_KEY = 'happiffie_session';

export function loadSession(): AuthSession | null {
  const value = localStorage.getItem(SESSION_KEY);
  return value ? (JSON.parse(value) as AuthSession) : null;
}

export function saveSession(session: AuthSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = loadSession()?.accessToken;
  const isFormData = init?.body instanceof FormData;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    throw new Error(`API ${response.status}: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  login: async (payload: LoginPayload) => {
    const response = await request<Omit<AuthSession, 'email'>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return { ...response, email: payload.email };
  },
  register: async (payload: RegisterPayload) => {
    const response = await request<Omit<AuthSession, 'email'>>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return { ...response, email: payload.email };
  },
  analyzeRequirement: (text: string) =>
    request<RequirementInsights>('/ai/requirements/analyze', {
      method: 'POST',
      body: JSON.stringify({ text }),
    }),
  createRequirement: (payload: RequirementForm) =>
    request<Requirement>('/requirements', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  listRequirements: () => request<Requirement[]>('/requirements'),
  listMatches: (requirementId: string) => request<Match[]>(`/matching/requirements/${requirementId}/vendors`),
  listUsers: () => request<User[]>('/users'),
  getUser: (id: string) => request<User>(`/users/${id}`),
  updateCustomerProfile: (id: string, payload: CustomerProfilePayload) =>
    request<User>(`/users/${id}/profile`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  uploadCustomerProfilePhoto: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('profilePhoto', file);
    return request<User>(`/users/${id}/profile-photo`, {
      method: 'POST',
      body: formData,
    });
  },
  createVendorWork: (vendorId: string, payload: VendorWorkPayload) => {
    const formData = new FormData();
    formData.append('title', payload.title);
    formData.append('category', payload.category);
    formData.append('description', payload.description ?? '');
    formData.append('eventDate', payload.eventDate ?? '');
    formData.append('location', payload.location ?? '');
    formData.append('clientName', payload.clientName ?? '');
    if (payload.guestCount !== undefined) {
      formData.append('guestCount', String(payload.guestCount));
    }
    formData.append('budgetRange', payload.budgetRange ?? '');
    formData.append('services', payload.services.join(','));
    formData.append('highlights', payload.highlights.join(','));
    formData.append('image', payload.image);
    return request<VendorWork>(`/vendors/${vendorId}/portfolio`, {
      method: 'POST',
      body: formData,
    });
  },
  listVendors: (includeAll = false) => request<Vendor[]>(includeAll ? '/vendors?includeAll=true' : '/vendors'),
  createVendor: (userId: string, payload: VendorRegistrationPayload) =>
    request<Vendor>('/vendors', {
      method: 'POST',
      body: JSON.stringify({ ...payload, userId }),
    }),
  updateVendorStatus: (id: string, status: 'pending' | 'active' | 'suspended') =>
    request<Vendor>(`/vendors/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  sendInvitation: (vendorId: string, requirementId: string) =>
    request<Invitation>('/invitations', {
      method: 'POST',
      body: JSON.stringify({ vendorId, requirementId }),
    }),
  listInvitations: () => request<Invitation[]>('/invitations'),
  respondInvitation: (id: string, status: 'accepted' | 'rejected', quotation?: number, message?: string) =>
    request<Invitation>(`/invitations/${id}/respond`, {
      method: 'PATCH',
      body: JSON.stringify({ status, quotation, message }),
    }),
  listBookings: () => request<Booking[]>('/bookings'),
  createBooking: (payload: CreateBookingPayload) =>
    request<Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  confirmPayment: (id: string) => request<Booking>(`/bookings/${id}/confirm-payment`, { method: 'PATCH' }),
  completeBooking: (id: string) => request<Booking>(`/bookings/${id}/complete`, { method: 'PATCH' }),
  listReviews: () => request<Review[]>('/reviews'),
  createReview: (payload: Omit<Review, 'id'>) =>
    request<Review>('/reviews', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  adminDashboard: () => request<AdminDashboard>('/admin/dashboard'),
};
