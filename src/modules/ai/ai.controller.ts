import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AnalyzeRequirementDto, ExplainMatchDto, MatchExplanationDto, RequirementInsightsDto } from '../../common/api-dtos';
import { AiService } from './ai.service';

@ApiTags('ai')
@ApiBearerAuth()
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('requirements/analyze')
  @ApiOperation({ summary: 'Extract structured event preferences from free-text customer requirements.' })
  @ApiOkResponse({ type: RequirementInsightsDto })
  analyzeRequirement(@Body() dto: AnalyzeRequirementDto): RequirementInsightsDto {
    return this.aiService.analyzeRequirementText(dto.text);
  }

  @Post('matches/explain')
  @ApiOperation({ summary: 'Explain why a vendor is recommended for a requirement.' })
  @ApiOkResponse({ type: MatchExplanationDto })
  explainMatch(@Body() dto: ExplainMatchDto): MatchExplanationDto {
    return this.aiService.explainMatch(dto.requirementId, dto.vendorId);
  }
}
