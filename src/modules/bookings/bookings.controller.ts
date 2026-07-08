import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BookingResponseDto, CreateBookingDto } from '../../common/api-dtos';
import { BookingStatus, PaymentStatus } from '../../common/enums';
import { SampleStoreService } from '../../common/sample-store.service';

@ApiTags('bookings')
@ApiBearerAuth()
@Controller('bookings')
export class BookingsController {
  constructor(private readonly store: SampleStoreService) {}

  @Get()
  @ApiOperation({ summary: 'List bookings for customers, vendors, or admins based on role.' })
  @ApiOkResponse({ type: BookingResponseDto, isArray: true })
  findAll() {
    return this.store.bookings;
  }

  @Post()
  @ApiOperation({ summary: 'Create a booking after the vendor accepts an invitation.' })
  @ApiCreatedResponse({ type: BookingResponseDto })
  create(@Body() dto: CreateBookingDto) {
    const booking = {
      ...dto,
      id: `book_${Date.now()}`,
      paymentMethod: dto.paymentMethod ?? 'upi',
      billingName: dto.billingName ?? 'Guest Customer',
      billingEmail: dto.billingEmail ?? '',
      billingPhone: dto.billingPhone ?? '',
      paymentStatus: PaymentStatus.Pending,
      bookingStatus: BookingStatus.PendingPayment,
    };
    this.store.bookings.push(booking);
    return booking;
  }

  @Patch(':id/confirm-payment')
  @ApiOperation({ summary: 'Mark payment as paid and confirm the booking.' })
  @ApiOkResponse({ type: BookingResponseDto })
  confirmPayment(@Param('id') id: string) {
    const booking = this.store.bookings.find((item) => item.id === id);
    if (!booking) {
      return null;
    }
    booking.paymentStatus = PaymentStatus.Paid;
    booking.bookingStatus = BookingStatus.Confirmed;
    return booking;
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Complete a confirmed booking after event delivery.' })
  @ApiOkResponse({ type: BookingResponseDto })
  complete(@Param('id') id: string) {
    const booking = this.store.bookings.find((item) => item.id === id);
    if (!booking) {
      return null;
    }
    booking.bookingStatus = BookingStatus.Completed;
    return booking;
  }
}
