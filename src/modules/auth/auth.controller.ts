import { Body, Controller, ForbiddenException, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthResponseDto, LoginDto, OtpLoginDto, RegisterDto } from '../../common/api-dtos';
import { SampleStoreService } from '../../common/sample-store.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly store: SampleStoreService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a customer, vendor, or admin user.' })
  @ApiCreatedResponse({ type: AuthResponseDto })
  register(@Body() dto: RegisterDto): AuthResponseDto {
    const id = `usr_${dto.role}_${Date.now()}`;
    this.store.users.push({
      id,
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      role: dto.role,
      createdAt: new Date().toISOString(),
    });

    return {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      userId: id,
      role: dto.role,
    };
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password.' })
  @ApiOkResponse({ type: AuthResponseDto })
  login(@Body() dto: LoginDto): AuthResponseDto {
    const email = dto.email.toLowerCase();
    const user = this.store.users.find((item) => item.email.toLowerCase() === email);
    const role = user?.role ?? (email.includes('admin') ? 'admin' : email.includes('vendor') || email.includes('temple') || email.includes('golden') ? 'vendor' : 'customer');

    if (role === 'vendor') {
      const vendor = this.store.vendors.find((item) => {
        if (user?.id) {
          return item.userId === user.id;
        }
        if (email.includes('temple')) {
          return item.userId === 'usr_vendor_1';
        }
        if (email.includes('golden')) {
          return item.userId === 'usr_vendor_2';
        }
        return false;
      });
      if (!vendor || vendor.status !== 'active') {
        throw new ForbiddenException('Vendor profile is pending admin approval.');
      }
    }

    return {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      userId: user?.id ?? `usr_${role}_1`,
      role: role as AuthResponseDto['role'],
    };
  }

  @Post('otp/verify')
  @ApiOperation({ summary: 'Verify phone OTP and return JWT tokens.' })
  @ApiOkResponse({ type: AuthResponseDto })
  verifyOtp(@Body() _dto: OtpLoginDto): AuthResponseDto {
    return {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      userId: 'usr_customer_1',
      role: 'customer' as AuthResponseDto['role'],
    };
  }
}
