import { Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { MatchResponseDto } from '../../common/api-dtos';
import { MatchingService } from './matching.service';

@ApiTags('matching')
@ApiBearerAuth()
@Controller('matching')
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Get('requirements/:requirementId/vendors')
  @ApiOperation({ summary: 'Calculate weighted vendor recommendations for a requirement.' })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiOkResponse({ type: MatchResponseDto, isArray: true })
  rank(@Param('requirementId') requirementId: string, @Query('limit', new ParseIntPipe({ optional: true })) limit = 10) {
    return this.matchingService.rankVendors(requirementId, limit);
  }

  @Post('requirements/:requirementId/run')
  @ApiOperation({ summary: 'Run the AI matching engine and persist/send top vendor invitations in production.' })
  @ApiOkResponse({ type: MatchResponseDto, isArray: true })
  run(@Param('requirementId') requirementId: string) {
    return this.matchingService.rankVendors(requirementId, 10);
  }
}
