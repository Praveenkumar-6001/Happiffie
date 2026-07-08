import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateRequirementDto, RequirementResponseDto, UpdateRequirementDto } from '../../common/api-dtos';
import { RequirementStatus } from '../../common/enums';
import { SampleStoreService } from '../../common/sample-store.service';

@ApiTags('requirements')
@ApiBearerAuth()
@Controller('requirements')
export class RequirementsController {
  constructor(private readonly store: SampleStoreService) {}

  @Get()
  @ApiOperation({ summary: 'List event requirements for the authenticated customer.' })
  @ApiOkResponse({ type: RequirementResponseDto, isArray: true })
  findAll() {
    return this.store.requirements;
  }

  @Post()
  @ApiOperation({ summary: 'Create an event requirement used by the matching engine.' })
  @ApiCreatedResponse({ type: RequirementResponseDto })
  create(@Body() dto: CreateRequirementDto) {
    const requirement = {
      ...dto,
      id: `req_${Date.now()}`,
      userId: 'usr_customer_1',
      city: dto.city.toLowerCase(),
      status: RequirementStatus.Matching,
      createdAt: new Date().toISOString(),
    };
    this.store.requirements.push(requirement);
    return requirement;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one event requirement.' })
  @ApiOkResponse({ type: RequirementResponseDto })
  findOne(@Param('id') id: string) {
    return this.store.findRequirement(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an event requirement before booking.' })
  @ApiOkResponse({ type: RequirementResponseDto })
  update(@Param('id') id: string, @Body() dto: UpdateRequirementDto) {
    const requirement = this.store.findRequirement(id);
    Object.assign(requirement, dto, dto.city ? { city: dto.city.toLowerCase() } : {});
    return requirement;
  }
}
