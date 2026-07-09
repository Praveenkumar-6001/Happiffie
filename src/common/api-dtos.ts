import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsDateString, IsEmail, IsEnum, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { BookingStatus, EventType, InvitationStatus, PaymentStatus, RequirementStatus, UserRole, VendorStatus } from './enums';

export class RegisterDto {
  @ApiProperty({ example: 'Ananya Raman' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'ananya@example.com' })
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({ example: '+919876543210' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'StrongPass@123' })
  @IsString()
  password!: string;

  @ApiProperty({ enum: UserRole, example: UserRole.Customer })
  @IsEnum(UserRole)
  role!: UserRole;
}

export class LoginDto {
  @ApiProperty({ example: 'ananya@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'StrongPass@123' })
  @IsString()
  password!: string;
}

export class OtpLoginDto {
  @ApiProperty({ example: '+919876543210' })
  @IsString()
  phone!: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  otp!: string;
}

export class AuthResponseDto {
  @ApiProperty({ example: 'eyJhbGciOi...' })
  accessToken!: string;

  @ApiProperty({ example: 'eyJhbGciOi...' })
  refreshToken!: string;

  @ApiProperty({ example: 'usr_customer_1' })
  userId!: string;

  @ApiProperty({ enum: UserRole })
  role!: UserRole;
}

export class UpdateCustomerProfileDto {
  @ApiPropertyOptional({ example: 'Ananya Raman' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'ananya@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+919876543210' })
  @IsOptional()
  @IsString()
  phone?: string;
}

export class CreateRequirementDto {
  @ApiProperty({ enum: EventType, example: EventType.Wedding })
  @IsEnum(EventType)
  eventType!: EventType;

  @ApiProperty({ example: 'Chennai' })
  @IsString()
  city!: string;

  @ApiProperty({ example: 500000 })
  @IsNumber()
  budget!: number;

  @ApiProperty({ example: 500 })
  @IsInt()
  guestCount!: number;

  @ApiPropertyOptional({ example: 'Traditional South Indian' })
  @IsOptional()
  @IsString()
  theme?: string;

  @ApiProperty({ example: '2026-08-15' })
  @IsDateString()
  eventDate!: string;

  @ApiPropertyOptional({ example: 'Temple style mandap with jasmine and marigold flowers.' })
  @IsOptional()
  @IsString()
  specialNotes?: string;
}

export class UpdateRequirementDto {
  @ApiPropertyOptional({ enum: EventType, example: EventType.Wedding })
  @IsOptional()
  @IsEnum(EventType)
  eventType?: EventType;

  @ApiPropertyOptional({ example: 'Chennai' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 500000 })
  @IsOptional()
  @IsNumber()
  budget?: number;

  @ApiPropertyOptional({ example: 500 })
  @IsOptional()
  @IsInt()
  guestCount?: number;

  @ApiPropertyOptional({ example: 'Traditional South Indian' })
  @IsOptional()
  @IsString()
  theme?: string;

  @ApiPropertyOptional({ example: '2026-08-15' })
  @IsOptional()
  @IsDateString()
  eventDate?: string;

  @ApiPropertyOptional({ example: 'Temple style mandap with jasmine and marigold flowers.' })
  @IsOptional()
  @IsString()
  specialNotes?: string;

  @ApiPropertyOptional({ enum: RequirementStatus })
  @IsOptional()
  @IsEnum(RequirementStatus)
  status?: RequirementStatus;
}

export class RequirementResponseDto extends CreateRequirementDto {
  @ApiProperty({ example: 'req_wedding_1' })
  id!: string;

  @ApiProperty({ example: 'usr_customer_1' })
  userId!: string;

  @ApiProperty({ enum: RequirementStatus })
  status!: RequirementStatus;
}

export class CreateVendorDto {
  @ApiProperty({ example: 'usr_vendor_1' })
  @IsString()
  userId!: string;

  @ApiProperty({ example: 'Temple Bloom Decor' })
  @IsString()
  businessName!: string;

  @ApiProperty({ example: 11 })
  @IsInt()
  experience!: number;

  @ApiProperty({ example: 4.8 })
  @IsNumber()
  rating!: number;

  @ApiProperty({ example: 96 })
  @IsNumber()
  responseRate!: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  verified!: boolean;

  @ApiProperty({ example: 'Traditional South Indian wedding decorators.' })
  @IsString()
  description!: string;

  @ApiProperty({ example: ['decorator', 'flower_designer'], isArray: true })
  @IsArray()
  services!: string[];

  @ApiProperty({ example: ['traditional south indian', 'temple theme'], isArray: true })
  @IsArray()
  specializations!: string[];

  @ApiProperty({ example: ['chennai', 'kanchipuram'], isArray: true })
  @IsArray()
  cities!: string[];

  @ApiProperty({ example: 80 })
  @IsInt()
  travelRadius!: number;

  @ApiProperty({ example: 150000 })
  @IsNumber()
  priceMin!: number;

  @ApiProperty({ example: 600000 })
  @IsNumber()
  priceMax!: number;

  @ApiPropertyOptional({ example: ['https://cdn.example.com/portfolio.jpg'], isArray: true })
  @IsOptional()
  @IsArray()
  portfolio?: string[];

  @ApiPropertyOptional({ example: ['2026-08-15'], isArray: true })
  @IsOptional()
  @IsArray()
  availableDates?: string[];
}

export class UpdateVendorStatusDto {
  @ApiProperty({
    enum: VendorStatus,
    example: VendorStatus.Active,
    description:
      'Admin-controlled vendor onboarding status. Use active to approve vendor login and matching access, pending to keep the vendor under review, or suspended to block participation.',
  })
  @IsEnum(VendorStatus)
  status!: VendorStatus;
}

export class CreateVendorWorkDto {
  @ApiProperty({ example: 'Birthday stage decoration' })
  @IsString()
  title!: string;

  @ApiProperty({ example: 'birthday' })
  @IsString()
  category!: string;

  @ApiPropertyOptional({ example: 'Balloon wall, cake table, and themed entrance setup.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '2026-08-15' })
  @IsOptional()
  @IsDateString()
  eventDate?: string;

  @ApiPropertyOptional({ example: 'Chennai' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ example: 'Raman Family' })
  @IsOptional()
  @IsString()
  clientName?: string;

  @ApiPropertyOptional({ example: 250 })
  @IsOptional()
  @IsInt()
  guestCount?: number;

  @ApiPropertyOptional({ example: 'Rs 2L - Rs 4L' })
  @IsOptional()
  @IsString()
  budgetRange?: string;

  @ApiPropertyOptional({ example: ['decorator', 'flower_designer'], isArray: true })
  @IsOptional()
  @IsArray()
  services?: string[];

  @ApiPropertyOptional({ example: ['Balloon wall', 'Cake table', 'Theme entrance'], isArray: true })
  @IsOptional()
  @IsArray()
  highlights?: string[];
}

export class VendorResponseDto extends CreateVendorDto {
  @ApiProperty({ example: 'ven_decor_1' })
  id!: string;

  @ApiProperty({
    enum: VendorStatus,
    example: VendorStatus.Pending,
    description:
      'Vendor onboarding status. New vendor profiles start as pending. Only active vendors can log in, appear in search, and be ranked by the matching engine.',
  })
  status!: VendorStatus;
}

export class MatchResponseDto {
  @ApiProperty({ example: 'req_wedding_1' })
  requirementId!: string;

  @ApiProperty({ example: 'ven_decor_1' })
  vendorId!: string;

  @ApiProperty({ example: 94.6 })
  score!: number;

  @ApiProperty({ example: 1 })
  rank!: number;

  @ApiProperty({ example: true })
  matchedByAI!: boolean;

  @ApiProperty({ example: 'Strong service, budget, location, availability, and rating fit.' })
  reason!: string;
}

export class CreateInvitationDto {
  @ApiProperty({ example: 'ven_decor_1' })
  @IsString()
  vendorId!: string;

  @ApiProperty({ example: 'req_wedding_1' })
  @IsString()
  requirementId!: string;
}

export class RespondInvitationDto {
  @ApiProperty({ enum: [InvitationStatus.Accepted, InvitationStatus.Rejected], example: InvitationStatus.Accepted })
  @IsEnum(InvitationStatus)
  status!: InvitationStatus.Accepted | InvitationStatus.Rejected;

  @ApiPropertyOptional({ example: 275000 })
  @IsOptional()
  @IsNumber()
  quotation?: number;

  @ApiPropertyOptional({ example: 'Available for the requested date with floral mandap package.' })
  @IsOptional()
  @IsString()
  message?: string;
}

export class CreateBookingDto {
  @ApiProperty({ example: 'ven_decor_1' })
  @IsString()
  vendorId!: string;

  @ApiProperty({ example: 'usr_customer_1' })
  @IsString()
  userId!: string;

  @ApiProperty({ example: 'req_wedding_1' })
  @IsString()
  requirementId!: string;

  @ApiProperty({ example: 275000 })
  @IsNumber()
  amount!: number;

  @ApiPropertyOptional({ example: 'upi' })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiPropertyOptional({ example: 'Ananya Raman' })
  @IsOptional()
  @IsString()
  billingName?: string;

  @ApiPropertyOptional({ example: 'ananya.customer@happiffie.test' })
  @IsOptional()
  @IsEmail()
  billingEmail?: string;

  @ApiPropertyOptional({ example: '+919876543210' })
  @IsOptional()
  @IsString()
  billingPhone?: string;
}

export class BookingResponseDto extends CreateBookingDto {
  @ApiProperty({ example: 'book_1' })
  id!: string;

  @ApiProperty({ enum: PaymentStatus })
  paymentStatus!: PaymentStatus;

  @ApiProperty({ enum: BookingStatus })
  bookingStatus!: BookingStatus;
}

export class CreateReviewDto {
  @ApiProperty({ example: 'book_1' })
  @IsString()
  bookingId!: string;

  @ApiProperty({ example: 'usr_customer_1' })
  @IsString()
  userId!: string;

  @ApiProperty({ example: 'ven_decor_1' })
  @IsString()
  vendorId!: string;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiPropertyOptional({ example: 'Excellent planning discussion and quick quotation.' })
  @IsOptional()
  @IsString()
  review?: string;
}

export class AdminDashboardDto {
  @ApiProperty({ example: 100000 })
  totalUsers!: number;

  @ApiProperty({ example: 50000 })
  totalVendors!: number;

  @ApiProperty({ example: 1430 })
  activeRequirements!: number;

  @ApiProperty({ example: 730 })
  invitationsSentToday!: number;

  @ApiProperty({ example: 0.72 })
  aiAcceptanceRate!: number;
}

export class AnalyzeRequirementDto {
  @ApiProperty({
    example:
      'Need a traditional South Indian wedding in Chennai for 500 guests on 2026-08-15. Budget is 500000. Prefer temple theme decor.',
  })
  @IsString()
  text!: string;
}

export class RequirementInsightsDto {
  @ApiProperty({ enum: EventType, example: EventType.Wedding })
  eventType!: EventType;

  @ApiProperty({ example: 'chennai' })
  city!: string;

  @ApiProperty({ example: 500000 })
  budget!: number;

  @ApiProperty({ example: 500 })
  guestCount!: number;

  @ApiProperty({ example: 'traditional south indian temple theme' })
  theme!: string;

  @ApiProperty({ example: '2026-08-15' })
  eventDate!: string;

  @ApiProperty({ example: ['decorator', 'flower_designer', 'event_planner'], isArray: true })
  suggestedServices!: string[];

  @ApiProperty({
    example: ['Large guest count requires high-capacity vendors.', 'Theme suggests decorators with temple and floral mandap experience.'],
    isArray: true,
  })
  notes!: string[];
}

export class ExplainMatchDto {
  @ApiProperty({ example: 'req_wedding_1' })
  @IsString()
  requirementId!: string;

  @ApiProperty({ example: 'ven_decor_1' })
  @IsString()
  vendorId!: string;
}

export class MatchExplanationDto {
  @ApiProperty({ example: 'ven_decor_1' })
  vendorId!: string;

  @ApiProperty({ example: 'Temple Bloom Decor is recommended because it serves Chennai, fits the budget, and is available on 2026-08-15.' })
  explanation!: string;

  @ApiProperty({ example: ['service_match', 'budget_match', 'location_match', 'availability_match'], isArray: true })
  signals!: string[];
}
