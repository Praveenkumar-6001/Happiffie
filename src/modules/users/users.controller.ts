import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SampleStoreService } from '../../common/sample-store.service';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly store: SampleStoreService) {}

  @Get()
  @ApiOperation({ summary: 'List users for admin views, optionally filtered by role.' })
  @ApiOkResponse({ description: 'User list.' })
  findAll(@Query('role') role?: string) {
    return role ? this.store.users.filter((user) => user.role === role) : this.store.users;
  }

  @Get('me')
  @ApiOperation({ summary: 'Get the authenticated user profile.' })
  @ApiOkResponse({ description: 'Current user profile.' })
  me() {
    return this.store.users[0];
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by id.' })
  @ApiOkResponse({ description: 'User profile.' })
  findOne(@Param('id') id: string) {
    return this.store.users.find((user) => user.id === id);
  }
}
