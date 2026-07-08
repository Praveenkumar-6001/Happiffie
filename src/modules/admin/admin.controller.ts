import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminDashboardDto } from '../../common/api-dtos';
import { SampleStoreService } from '../../common/sample-store.service';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin')
export class AdminController {
  constructor(private readonly store: SampleStoreService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Admin dashboard metrics for users, vendors, requirements, invitations, and AI matching.' })
  @ApiOkResponse({ type: AdminDashboardDto })
  dashboard(): AdminDashboardDto {
    return {
      totalUsers: this.store.users.length,
      totalVendors: this.store.vendors.length,
      activeRequirements: this.store.requirements.length,
      invitationsSentToday: this.store.invitations.length,
      aiAcceptanceRate: 0.72,
    };
  }
}
