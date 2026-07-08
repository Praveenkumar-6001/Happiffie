export enum UserRole {
  Customer = 'customer',
  Vendor = 'vendor',
  Admin = 'admin',
}

export enum EventType {
  Wedding = 'wedding',
  Birthday = 'birthday',
  Engagement = 'engagement',
  CorporateEvent = 'corporate_event',
  BabyShower = 'baby_shower',
  Reception = 'reception',
}

export enum RequirementStatus {
  Draft = 'draft',
  Matching = 'matching',
  Invited = 'invited',
  Booked = 'booked',
  Completed = 'completed',
  Cancelled = 'cancelled',
}

export enum VendorStatus {
  Pending = 'pending',
  Active = 'active',
  Suspended = 'suspended',
}

export enum InvitationStatus {
  Pending = 'pending',
  Viewed = 'viewed',
  Accepted = 'accepted',
  Rejected = 'rejected',
  Expired = 'expired',
}

export enum BookingStatus {
  PendingPayment = 'pending_payment',
  Confirmed = 'confirmed',
  Completed = 'completed',
  Cancelled = 'cancelled',
}

export enum PaymentStatus {
  Pending = 'pending',
  Paid = 'paid',
  Failed = 'failed',
  Refunded = 'refunded',
}
