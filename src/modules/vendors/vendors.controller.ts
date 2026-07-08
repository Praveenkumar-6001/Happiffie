import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateVendorDto, UpdateVendorStatusDto, VendorResponseDto } from '../../common/api-dtos';
import { VendorStatus } from '../../common/enums';
import { SampleStoreService } from '../../common/sample-store.service';

@ApiTags('vendors')
@ApiBearerAuth()
@Controller('vendors')
export class VendorsController {
  constructor(private readonly store: SampleStoreService) {}

  @Get()
  @ApiOperation({ summary: 'Search vendors by city, service, theme, price, or status.' })
  @ApiQuery({ name: 'city', required: false, example: 'chennai' })
  @ApiQuery({ name: 'service', required: false, example: 'decorator' })
  @ApiQuery({ name: 'maxPrice', required: false, example: 500000 })
  @ApiOkResponse({ type: VendorResponseDto, isArray: true })
  findAll(@Query('city') city?: string, @Query('service') service?: string, @Query('maxPrice') maxPrice?: string) {
    return this.store.vendors.filter((vendor) => {
      const cityMatch = !city || vendor.cities.includes(city.toLowerCase());
      const serviceMatch = !service || vendor.services.includes(service.toLowerCase());
      const priceMatch = !maxPrice || vendor.priceMin <= Number(maxPrice);
      return vendor.status === VendorStatus.Active && cityMatch && serviceMatch && priceMatch;
    });
  }

  @Post()
  @ApiOperation({ summary: 'Create a vendor profile with services, pricing, cities, and portfolio metadata.' })
  @ApiCreatedResponse({ type: VendorResponseDto })
  create(@Body() dto: CreateVendorDto) {
    const vendor = {
      ...dto,
      id: `ven_${Date.now()}`,
      status: VendorStatus.Pending,
      portfolio: dto.portfolio ?? [],
      availableDates: dto.availableDates ?? [],
    };
    this.store.vendors.push(vendor);
    return vendor;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a vendor profile.' })
  @ApiOkResponse({ type: VendorResponseDto })
  findOne(@Param('id') id: string) {
    return this.store.vendors.find((vendor) => vendor.id === id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Admin moderation endpoint to activate, suspend, or keep vendor pending.' })
  @ApiOkResponse({ type: VendorResponseDto })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateVendorStatusDto) {
    const vendor = this.store.vendors.find((item) => item.id === id);
    if (!vendor) {
      return null;
    }
    vendor.status = dto.status;
    return vendor;
  }
}
