import { Injectable, NotFoundException } from '@nestjs/common';
import { BookingStatus, EventType, InvitationStatus, PaymentStatus, RequirementStatus, UserRole, VendorStatus } from './enums';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profilePhoto?: string;
  role: UserRole;
  createdAt: string;
}

export interface VendorRecord {
  id: string;
  userId: string;
  businessName: string;
  experience: number;
  rating: number;
  responseRate: number;
  verified: boolean;
  status: VendorStatus;
  description: string;
  services: string[];
  specializations: string[];
  cities: string[];
  travelRadius: number;
  priceMin: number;
  priceMax: number;
  portfolio: VendorWorkRecord[];
  availableDates: string[];
}

export interface VendorWorkRecord {
  id: string;
  vendorId: string;
  title: string;
  category: string;
  description?: string;
  eventDate?: string;
  location?: string;
  clientName?: string;
  guestCount?: number;
  budgetRange?: string;
  services: string[];
  highlights: string[];
  imageUrl: string;
  createdAt: string;
}

export interface RequirementRecord {
  id: string;
  userId: string;
  eventType: EventType;
  city: string;
  budget: number;
  guestCount: number;
  theme?: string;
  eventDate: string;
  specialNotes?: string;
  status: RequirementStatus;
  createdAt: string;
}

export interface MatchRecord {
  requirementId: string;
  vendorId: string;
  score: number;
  rank: number;
  matchedByAI: boolean;
  reason: string;
}

@Injectable()
export class SampleStoreService {
  users: UserRecord[] = [
    {
      id: 'usr_customer_1',
      name: 'Ananya Raman',
      email: 'ananya.customer@happiffie.test',
      phone: '+919876543210',
      role: UserRole.Customer,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'usr_customer_2',
      name: 'Karthik Iyer',
      email: 'karthik.customer@happiffie.test',
      phone: '+919876543214',
      role: UserRole.Customer,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'usr_vendor_1',
      name: 'Temple Bloom Manager',
      email: 'temple.bloom@happiffie.test',
      phone: '+919876543211',
      role: UserRole.Vendor,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'usr_vendor_2',
      name: 'Golden Hour Manager',
      email: 'golden.hour@happiffie.test',
      phone: '+919876543212',
      role: UserRole.Vendor,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'usr_admin_1',
      name: 'Happiffie Admin',
      email: 'admin@happiffie.test',
      phone: '+919876543213',
      role: UserRole.Admin,
      createdAt: new Date().toISOString(),
    },
  ];

  vendors: VendorRecord[] = [
    {
      id: 'ven_decor_1',
      userId: 'usr_vendor_1',
      businessName: 'Temple Bloom Decor',
      experience: 11,
      rating: 4.8,
      responseRate: 96,
      verified: true,
      status: VendorStatus.Active,
      description: 'Traditional South Indian wedding decorators with floral mandap and temple theme expertise.',
      services: ['decorator', 'flower_designer', 'event_planner'],
      specializations: ['traditional south indian', 'temple theme', 'wedding'],
      cities: ['chennai', 'kanchipuram', 'pondicherry'],
      travelRadius: 80,
      priceMin: 150000,
      priceMax: 600000,
      portfolio: [
        {
          id: 'work_temple_1',
          vendorId: 'ven_decor_1',
          title: 'Traditional mandap setup',
          category: 'marriage',
          description: 'Floral mandap and temple-style decor for a South Indian wedding.',
          eventDate: '2026-02-12',
          location: 'Chennai',
          clientName: 'Raman Family',
          guestCount: 450,
          budgetRange: 'Rs 3L - Rs 5L',
          services: ['decorator', 'flower_designer'],
          highlights: ['Temple backdrop', 'Jasmine floral ceiling'],
          imageUrl: 'https://cdn.example.com/temple-bloom/mandap.jpg',
          createdAt: new Date().toISOString(),
        },
      ],
      availableDates: ['2026-08-15', '2026-09-01'],
    },
    {
      id: 'ven_photo_1',
      userId: 'usr_vendor_2',
      businessName: 'Golden Hour Weddings',
      experience: 8,
      rating: 4.6,
      responseRate: 88,
      verified: true,
      status: VendorStatus.Active,
      description: 'Wedding photography and candid video team for large celebrations.',
      services: ['photographer'],
      specializations: ['wedding', 'candid', 'reception'],
      cities: ['chennai', 'coimbatore'],
      travelRadius: 120,
      priceMin: 90000,
      priceMax: 350000,
      portfolio: [
        {
          id: 'work_golden_1',
          vendorId: 'ven_photo_1',
          title: 'Golden hour wedding shoot',
          category: 'marriage',
          description: 'Candid wedding photography and reception coverage.',
          eventDate: '2026-01-18',
          location: 'Coimbatore',
          clientName: 'Iyer Family',
          guestCount: 300,
          budgetRange: 'Rs 1L - Rs 2L',
          services: ['photographer', 'candid_video'],
          highlights: ['Golden hour couple shoot', 'Reception album'],
          imageUrl: 'https://cdn.example.com/golden-hour/wedding.jpg',
          createdAt: new Date().toISOString(),
        },
      ],
      availableDates: ['2026-08-15'],
    },
  ];

  requirements: RequirementRecord[] = [
    {
      id: 'req_wedding_1',
      userId: 'usr_customer_1',
      eventType: EventType.Wedding,
      city: 'chennai',
      budget: 500000,
      guestCount: 500,
      theme: 'Traditional South Indian',
      eventDate: '2026-08-15',
      specialNotes: 'Temple style mandap with jasmine and marigold flowers.',
      status: RequirementStatus.Matching,
      createdAt: new Date().toISOString(),
    },
  ];

  invitations = [
    {
      id: 'inv_1',
      vendorId: 'ven_decor_1',
      requirementId: 'req_wedding_1',
      status: InvitationStatus.Pending,
      sentAt: new Date().toISOString(),
      respondedAt: null as string | null,
    },
  ];

  bookings = [
    {
      id: 'book_1',
      vendorId: 'ven_decor_1',
      userId: 'usr_customer_1',
      requirementId: 'req_wedding_1',
      amount: 275000,
      paymentMethod: 'upi',
      billingName: 'Ananya Raman',
      billingEmail: 'ananya.customer@happiffie.test',
      billingPhone: '+919876543210',
      paymentStatus: PaymentStatus.Pending,
      bookingStatus: BookingStatus.PendingPayment,
    },
  ];

  reviews = [
    {
      id: 'rev_1',
      bookingId: 'book_1',
      userId: 'usr_customer_1',
      vendorId: 'ven_decor_1',
      rating: 5,
      review: 'Excellent planning discussion and quick quotation.',
    },
  ];

  findRequirement(id: string) {
    const requirement = this.requirements.find((item) => item.id === id);
    if (!requirement) {
      throw new NotFoundException(`Requirement ${id} not found`);
    }
    return requirement;
  }
}
