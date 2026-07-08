import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateReviewDto } from '../../common/api-dtos';
import { SampleStoreService } from '../../common/sample-store.service';

@ApiTags('reviews')
@ApiBearerAuth()
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly store: SampleStoreService) {}

  @Get()
  @ApiOperation({ summary: 'List all reviews for admin monitoring.' })
  @ApiOkResponse({ description: 'Review list.' })
  findAll() {
    return this.store.reviews;
  }

  @Get('vendors/:vendorId')
  @ApiOperation({ summary: 'List reviews for a vendor.' })
  @ApiOkResponse({ description: 'Vendor review list.' })
  findByVendor(@Param('vendorId') vendorId: string) {
    return this.store.reviews.filter((review) => review.vendorId === vendorId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a review after booking completion.' })
  @ApiCreatedResponse({ description: 'Review created.' })
  create(@Body() dto: CreateReviewDto) {
    const review = {
      ...dto,
      id: `rev_${Date.now()}`,
      review: dto.review ?? '',
    };
    this.store.reviews.push(review);
    return review;
  }
}
