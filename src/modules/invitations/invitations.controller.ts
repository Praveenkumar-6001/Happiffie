import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateInvitationDto, RespondInvitationDto } from '../../common/api-dtos';
import { InvitationStatus } from '../../common/enums';
import { SampleStoreService } from '../../common/sample-store.service';

@ApiTags('invitations')
@ApiBearerAuth()
@Controller('invitations')
export class InvitationsController {
  constructor(private readonly store: SampleStoreService) {}

  @Get()
  @ApiOperation({ summary: 'List invitations sent to vendors.' })
  @ApiOkResponse({ description: 'Invitation list.' })
  findAll() {
    return this.store.invitations;
  }

  @Post()
  @ApiOperation({ summary: 'Send an invitation to a matched vendor.' })
  @ApiCreatedResponse({ description: 'Invitation created.' })
  create(@Body() dto: CreateInvitationDto) {
    const invitation = {
      id: `inv_${Date.now()}`,
      vendorId: dto.vendorId,
      requirementId: dto.requirementId,
      status: InvitationStatus.Pending,
      sentAt: new Date().toISOString(),
      respondedAt: null,
    };
    this.store.invitations.push(invitation);
    return invitation;
  }

  @Patch(':id/viewed')
  @ApiOperation({ summary: 'Mark a vendor invitation as viewed.' })
  @ApiOkResponse({ description: 'Invitation marked viewed.' })
  viewed(@Param('id') id: string) {
    const invitation = this.store.invitations.find((item) => item.id === id);
    if (!invitation) {
      return null;
    }
    invitation.status = InvitationStatus.Viewed;
    return invitation;
  }

  @Patch(':id/respond')
  @ApiOperation({ summary: 'Accept or reject an invitation and optionally attach quotation details.' })
  @ApiOkResponse({ description: 'Invitation response.' })
  respond(@Param('id') id: string, @Body() dto: RespondInvitationDto) {
    const invitation = this.store.invitations.find((item) => item.id === id);
    if (!invitation) {
      return null;
    }
    invitation.status = dto.status;
    invitation.respondedAt = new Date().toISOString();
    return { ...invitation, quotation: dto.quotation, message: dto.message };
  }
}
