import { BadRequestException, Body, Controller, Get, NotFoundException, Param, Patch, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Vendor } from '@prisma/client';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateVendorDto, CreateVendorWorkDto, UpdateVendorStatusDto, VendorResponseDto } from '../../common/api-dtos';
import { VendorStatus } from '../../common/enums';
import {
  profileImageFileFilter,
  profileImageToDataUrl,
  UploadedProfileImage,
  WORK_IMAGE_FIELD,
  WORK_IMAGE_MAX_BYTES,
} from '../../common/profile-image';
import { PrismaService } from '../../common/prisma.service';
import { SampleStoreService } from '../../common/sample-store.service';

@ApiTags('vendors')
@ApiBearerAuth()
@Controller('vendors')
export class VendorsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly store: SampleStoreService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Search vendors by city, service, theme, price, or approval status.',
    description:
      'By default this returns only active vendors for customer-facing search and matching. Admin/vendor dashboards can pass includeAll=true or status=pending to review vendors waiting for approval.',
  })
  @ApiQuery({ name: 'city', required: false, example: 'chennai' })
  @ApiQuery({ name: 'service', required: false, example: 'decorator' })
  @ApiQuery({ name: 'maxPrice', required: false, example: 500000 })
  @ApiQuery({ name: 'status', required: false, enum: VendorStatus, description: 'Admin filter for pending, active, or suspended vendors.' })
  @ApiQuery({
    name: 'includeAll',
    required: false,
    example: true,
    description: 'Set true for admin/vendor dashboards to include pending and suspended vendors.',
  })
  @ApiOkResponse({ type: VendorResponseDto, isArray: true })
  async findAll(
    @Query('city') city?: string,
    @Query('service') service?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('status') status?: VendorStatus,
    @Query('includeAll') includeAll?: string,
  ) {
    const includeInactive = includeAll === 'true' || includeAll === '1';
    const dbVendors = await this.prisma.vendor.findMany({
      where: {
        ...(status ? { status } : includeInactive ? {} : { status: VendorStatus.Active }),
        ...(city ? { profile: { cities: { has: city.toLowerCase() } } } : {}),
        ...(service ? { profile: { services: { has: service.toLowerCase() } } } : {}),
        ...(maxPrice ? { profile: { priceMin: { lte: Number(maxPrice) } } } : {}),
      },
      include: {
        profile: true,
        availability: true,
        portfolio: true,
      },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    });

    if (dbVendors.length > 0 || includeInactive || status) {
      return dbVendors.map((vendor) => this.toVendorResponse(vendor));
    }

    return this.store.vendors.filter((vendor) => {
      const cityMatch = !city || vendor.cities.includes(city.toLowerCase());
      const serviceMatch = !service || vendor.services.includes(service.toLowerCase());
      const priceMatch = !maxPrice || vendor.priceMin <= Number(maxPrice);
      const statusMatch = status ? vendor.status === status : includeInactive || vendor.status === VendorStatus.Active;
      return statusMatch && cityMatch && serviceMatch && priceMatch;
    });
  }

  @Post()
  @ApiOperation({
    summary: 'Create a vendor profile and submit it for admin approval.',
    description:
      'Vendor registration details are saved with status pending. The vendor cannot log in or appear in customer matching until an admin approves the profile by setting status to active.',
  })
  @ApiCreatedResponse({
    type: VendorResponseDto,
    description: 'Vendor profile created with pending status and waiting for admin approval.',
  })
  async create(@Body() dto: CreateVendorDto) {
    const user = await this.prisma.user.findUnique({ where: { id: dto.userId } });
    if (!user) {
      throw new BadRequestException('Vendor user does not exist. Register the vendor user first, then create the vendor profile.');
    }

    const vendor = await this.prisma.$transaction(async (tx) => {
      const savedVendor = await tx.vendor.upsert({
        where: { userId: dto.userId },
        update: {
          businessName: dto.businessName,
          experience: dto.experience,
          rating: dto.rating,
          responseRate: dto.responseRate,
          verified: false,
          status: VendorStatus.Pending,
        },
        create: {
          userId: dto.userId,
          businessName: dto.businessName,
          experience: dto.experience,
          rating: dto.rating,
          responseRate: dto.responseRate,
          verified: false,
          status: VendorStatus.Pending,
        },
      });

      await tx.vendorProfile.upsert({
        where: { vendorId: savedVendor.id },
        update: {
          description: dto.description,
          services: dto.services.map((service) => service.toLowerCase()),
          specializations: dto.specializations.map((specialization) => specialization.toLowerCase()),
          cities: dto.cities.map((city) => city.toLowerCase()),
          travelRadius: dto.travelRadius,
          priceMin: dto.priceMin,
          priceMax: dto.priceMax,
        },
        create: {
          vendorId: savedVendor.id,
          description: dto.description,
          services: dto.services.map((service) => service.toLowerCase()),
          specializations: dto.specializations.map((specialization) => specialization.toLowerCase()),
          cities: dto.cities.map((city) => city.toLowerCase()),
          travelRadius: dto.travelRadius,
          priceMin: dto.priceMin,
          priceMax: dto.priceMax,
        },
      });

      await tx.vendorAvailability.deleteMany({ where: { vendorId: savedVendor.id } });
      if (dto.availableDates?.length) {
        await tx.vendorAvailability.createMany({
          data: dto.availableDates.map((date) => ({
            vendorId: savedVendor.id,
            date: new Date(`${date}T00:00:00.000Z`),
            available: true,
          })),
        });
      }

      await tx.portfolio.deleteMany({ where: { vendorId: savedVendor.id } });
      if (dto.portfolio?.length) {
        await tx.portfolio.createMany({
          data: dto.portfolio.map((imageUrl) => ({
            vendorId: savedVendor.id,
            title: 'Vendor work',
            imageUrl,
            category: 'general',
          })),
        });
      }

      return tx.vendor.findUniqueOrThrow({
        where: { id: savedVendor.id },
        include: {
          profile: true,
          availability: true,
          portfolio: true,
        },
      });
    });

    return this.toVendorResponse(vendor);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a vendor profile.' })
  @ApiOkResponse({ type: VendorResponseDto })
  async findOne(@Param('id') id: string) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { id },
      include: {
        profile: true,
        availability: true,
        portfolio: true,
      },
    });

    return vendor ? this.toVendorResponse(vendor) : this.store.vendors.find((item) => item.id === id);
  }

  @Post(':id/portfolio')
  @UseInterceptors(
    FileInterceptor(WORK_IMAGE_FIELD, {
      fileFilter: profileImageFileFilter,
      limits: { fileSize: WORK_IMAGE_MAX_BYTES },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Birthday stage decoration' },
        category: { type: 'string', example: 'birthday' },
        description: { type: 'string', example: 'Balloon wall and cake table setup.' },
        eventDate: { type: 'string', example: '2026-08-15' },
        location: { type: 'string', example: 'Chennai' },
        clientName: { type: 'string', example: 'Raman Family' },
        guestCount: { type: 'number', example: 250 },
        budgetRange: { type: 'string', example: 'Rs 2L - Rs 4L' },
        services: { type: 'string', example: 'decorator, flower_designer' },
        highlights: { type: 'string', example: 'Balloon wall, Cake table, Theme entrance' },
        image: { type: 'string', format: 'binary' },
      },
      required: ['title', 'category', 'image'],
    },
  })
  @ApiOperation({ summary: 'Upload a vendor work card to the vendor portfolio.' })
  @ApiOkResponse({ description: 'Updated vendor profile with the new work card.' })
  async addPortfolioWork(
    @Param('id') id: string,
    @Body() dto: CreateVendorWorkDto,
    @UploadedFile() file?: UploadedProfileImage,
  ) {
    const imageUrl = profileImageToDataUrl(file);
    const existingVendor = await this.prisma.vendor.findUnique({ where: { id } });
    if (existingVendor) {
      const work = await this.prisma.portfolio.create({
        data: {
          vendorId: id,
          title: dto.title,
          category: dto.category.toLowerCase(),
          description: dto.description,
          eventDate: dto.eventDate ? new Date(`${dto.eventDate}T00:00:00.000Z`) : undefined,
          location: dto.location,
          clientName: dto.clientName,
          guestCount: dto.guestCount !== undefined ? Number(dto.guestCount) : undefined,
          budgetRange: dto.budgetRange,
          services: this.toStringList(dto.services),
          highlights: this.toStringList(dto.highlights),
          imageUrl,
        },
      });
      return work;
    }

    const sampleVendor = this.store.vendors.find((item) => item.id === id);
    if (!sampleVendor) {
      throw new NotFoundException(`Vendor ${id} not found`);
    }

    const work = {
      id: `work_${Date.now()}`,
      vendorId: id,
      title: dto.title,
      category: dto.category.toLowerCase(),
      description: dto.description,
      eventDate: dto.eventDate,
      location: dto.location,
      clientName: dto.clientName,
      guestCount: dto.guestCount !== undefined ? Number(dto.guestCount) : undefined,
      budgetRange: dto.budgetRange,
      services: this.toStringList(dto.services),
      highlights: this.toStringList(dto.highlights),
      imageUrl,
      createdAt: new Date().toISOString(),
    };
    sampleVendor.portfolio.unshift(work);
    return work;
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Approve, suspend, or keep a vendor pending.',
    description:
      'Admin moderation endpoint for vendor onboarding. Set status to active to approve the vendor and allow vendor login/dashboard access. Set status to suspended to block marketplace participation.',
  })
  @ApiBody({
    type: UpdateVendorStatusDto,
    examples: {
      approveVendor: {
        summary: 'Approve vendor login',
        value: { status: VendorStatus.Active },
      },
      keepPending: {
        summary: 'Keep vendor waiting for review',
        value: { status: VendorStatus.Pending },
      },
      suspendVendor: {
        summary: 'Suspend vendor',
        value: { status: VendorStatus.Suspended },
      },
    },
  })
  @ApiOkResponse({
    type: VendorResponseDto,
    description: 'Updated vendor profile. Active vendors can log in and are included in matching/search.',
  })
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateVendorStatusDto) {
    const existingVendor = await this.prisma.vendor.findUnique({ where: { id } });
    if (existingVendor) {
      const vendor = await this.prisma.vendor.update({
        where: { id },
        data: {
          status: dto.status,
          verified: dto.status === VendorStatus.Active ? true : undefined,
        },
        include: {
          profile: true,
          availability: true,
          portfolio: true,
        },
      });
      return this.toVendorResponse(vendor);
    }

    const vendor = this.store.vendors.find((item) => item.id === id);
    if (!vendor) return null;
    vendor.status = dto.status;
    vendor.verified = dto.status === VendorStatus.Active ? true : vendor.verified;
    return vendor;
  }

  private toVendorResponse(
    vendor: Vendor & {
      profile: {
        description: string;
        services: string[];
        specializations: string[];
        cities: string[];
        travelRadius: number;
        priceMin: unknown;
        priceMax: unknown;
      } | null;
      availability: Array<{ date: Date; available: boolean }>;
      portfolio: Array<{
        id: string;
        title: string;
        imageUrl: string;
        category: string;
        description: string | null;
        eventDate: Date | null;
        location: string | null;
        clientName: string | null;
        guestCount: number | null;
        budgetRange: string | null;
        services: string[];
        highlights: string[];
        createdAt: Date;
      }>;
    },
  ) {
    return {
      id: vendor.id,
      userId: vendor.userId,
      businessName: vendor.businessName,
      experience: vendor.experience,
      rating: vendor.rating,
      responseRate: vendor.responseRate,
      verified: vendor.verified,
      status: vendor.status,
      description: vendor.profile?.description ?? '',
      services: vendor.profile?.services ?? [],
      specializations: vendor.profile?.specializations ?? [],
      cities: vendor.profile?.cities ?? [],
      travelRadius: vendor.profile?.travelRadius ?? 0,
      priceMin: Number(vendor.profile?.priceMin ?? 0),
      priceMax: Number(vendor.profile?.priceMax ?? 0),
      portfolio: vendor.portfolio.map((item) => ({
        id: item.id,
        vendorId: vendor.id,
        title: item.title,
        category: item.category,
        description: item.description ?? undefined,
        eventDate: item.eventDate?.toISOString().slice(0, 10),
        location: item.location ?? undefined,
        clientName: item.clientName ?? undefined,
        guestCount: item.guestCount ?? undefined,
        budgetRange: item.budgetRange ?? undefined,
        services: item.services,
        highlights: item.highlights,
        imageUrl: item.imageUrl,
        createdAt: item.createdAt.toISOString(),
      })),
      availableDates: vendor.availability.filter((item) => item.available).map((item) => item.date.toISOString().slice(0, 10)),
    };
  }

  private toStringList(value?: string[] | string) {
    if (!value) return [];
    const items = Array.isArray(value) ? value : value.split(',');
    return items.map((item) => String(item).trim().toLowerCase()).filter(Boolean);
  }
}
