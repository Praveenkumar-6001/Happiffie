import { Body, Controller, ForbiddenException, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthResponseDto, LoginDto, OtpLoginDto, RegisterDto } from '../../common/api-dtos';
import { PrismaService } from '../../common/prisma.service';
import { SampleStoreService } from '../../common/sample-store.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly store: SampleStoreService,
  ) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register a customer, vendor, or admin user.',
    description:
      'Creates the user account. When the selected role is vendor, the frontend must also create a vendor profile through POST /vendors. Newly created vendor profiles are stored as pending and require admin approval before the vendor can log in.',
  })
  @ApiCreatedResponse({ type: AuthResponseDto })
  async register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    const user = await this.prisma.user.upsert({
      where: { email: dto.email.toLowerCase() },
      update: {
        name: dto.name,
        phone: dto.phone,
        role: dto.role,
      },
      create: {
        name: dto.name,
        email: dto.email.toLowerCase(),
        phone: dto.phone,
        passwordHash: dto.password,
        role: dto.role,
      },
    });

    this.store.users.push({
      id: user.id,
      name: dto.name,
      email: dto.email.toLowerCase(),
      phone: dto.phone,
      role: dto.role,
      createdAt: new Date().toISOString(),
    });

    return {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      userId: user.id,
      role: dto.role,
    };
  }

  @Post('login')
  @ApiOperation({
    summary: 'Login with email and password.',
    description:
      'Returns mock JWT tokens for approved users. Vendor users can log in only after an admin activates their vendor profile with PATCH /vendors/{id}/status. Pending or missing vendor profiles receive a 403 response.',
  })
  @ApiOkResponse({ type: AuthResponseDto })
  @ApiForbiddenResponse({
    description: 'Vendor profile is pending admin approval. Admin must update the vendor status to active before login is allowed.',
    schema: {
      example: {
        message: 'Vendor profile is pending admin approval.',
        error: 'Forbidden',
        statusCode: 403,
      },
    },
  })
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    const email = dto.email.toLowerCase();
    const dbUser = await this.prisma.user.findUnique({
      where: { email },
      include: { vendor: true },
    });
    const user = dbUser ?? this.store.users.find((item) => item.email.toLowerCase() === email);
    const role = user?.role ?? (email.includes('admin') ? 'admin' : email.includes('vendor') || email.includes('temple') || email.includes('golden') ? 'vendor' : 'customer');

    if (role === 'vendor') {
      const vendor = dbUser?.vendor ?? this.store.vendors.find((item) => {
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
