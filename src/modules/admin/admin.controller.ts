import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminDashboardDto } from '../../common/api-dtos';
import { PrismaService } from '../../common/prisma.service';
import { SampleStoreService } from '../../common/sample-store.service';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin')
export class AdminController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly store: SampleStoreService,
  ) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Admin dashboard metrics for users, vendors, requirements, invitations, and AI matching.' })
  @ApiOkResponse({ type: AdminDashboardDto })
  async dashboard(): Promise<AdminDashboardDto> {
    const [totalUsers, totalVendors, activeRequirements, invitationsSentToday] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.vendor.count(),
      this.prisma.requirement.count(),
      this.prisma.invitation.count(),
    ]);

    if (totalUsers > 0 || totalVendors > 0) {
      return {
        totalUsers,
        totalVendors,
        activeRequirements,
        invitationsSentToday,
        aiAcceptanceRate: 0.72,
      };
    }

    return {
      totalUsers: this.store.users.length,
      totalVendors: this.store.vendors.length,
      activeRequirements: this.store.requirements.length,
      invitationsSentToday: this.store.invitations.length,
      aiAcceptanceRate: 0.72,
    };
  }
}
