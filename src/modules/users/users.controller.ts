import { Body, Controller, Get, NotFoundException, Param, Patch, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdateCustomerProfileDto } from '../../common/api-dtos';
import {
  PROFILE_IMAGE_FIELD,
  PROFILE_IMAGE_MAX_BYTES,
  profileImageFileFilter,
  profileImageToDataUrl,
  UploadedProfileImage,
} from '../../common/profile-image';
import { PrismaService } from '../../common/prisma.service';
import { SampleStoreService } from '../../common/sample-store.service';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly store: SampleStoreService,
  ) {}

  private toSafeUser(user: {
    passwordHash?: string;
    updatedAt?: Date;
    [key: string]: unknown;
  }) {
    const { passwordHash: _passwordHash, updatedAt: _updatedAt, ...safeUser } = user;
    return safeUser;
  }

  @Get()
  @ApiOperation({ summary: 'List users for admin views, optionally filtered by role.' })
  @ApiOkResponse({ description: 'User list.' })
  async findAll(@Query('role') role?: string) {
    const users = await this.prisma.user.findMany({
      where: role ? { role: role as never } : undefined,
      orderBy: { createdAt: 'desc' },
    });

    if (users.length > 0) {
      return users.map((user) => this.toSafeUser(user));
    }

    return role ? this.store.users.filter((user) => user.role === role) : this.store.users;
  }

  @Get('me')
  @ApiOperation({ summary: 'Get the authenticated user profile.' })
  @ApiOkResponse({ description: 'Current user profile.' })
  async me() {
    const user = await this.prisma.user.findFirst({ orderBy: { createdAt: 'asc' } });
    if (!user) return this.store.users[0];
    return this.toSafeUser(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by id.' })
  @ApiOkResponse({ description: 'User profile.' })
  async findOne(@Param('id') id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) return this.store.users.find((item) => item.id === id);
    return this.toSafeUser(user);
  }

  @Patch(':id/profile')
  @ApiOperation({ summary: 'Update editable customer profile details.' })
  @ApiOkResponse({ description: 'Updated customer profile.' })
  async updateProfile(@Param('id') id: string, @Body() dto: UpdateCustomerProfileDto) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (existing) {
      const updated = await this.prisma.user.update({
        where: { id },
        data: {
          ...(dto.name !== undefined ? { name: dto.name } : {}),
          ...(dto.email !== undefined ? { email: dto.email.toLowerCase() } : {}),
          ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
        },
      });
      return this.toSafeUser(updated);
    }

    const sampleUser = this.store.users.find((item) => item.id === id);
    if (!sampleUser) {
      throw new NotFoundException(`User ${id} not found`);
    }

    Object.assign(sampleUser, {
      ...(dto.name !== undefined ? { name: dto.name } : {}),
      ...(dto.email !== undefined ? { email: dto.email.toLowerCase() } : {}),
      ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
    });
    return sampleUser;
  }

  @Post(':id/profile-photo')
  @UseInterceptors(
    FileInterceptor(PROFILE_IMAGE_FIELD, {
      fileFilter: profileImageFileFilter,
      limits: { fileSize: PROFILE_IMAGE_MAX_BYTES },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        profilePhoto: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['profilePhoto'],
    },
  })
  @ApiOperation({ summary: 'Upload a customer profile photo with multipart/form-data.' })
  @ApiOkResponse({ description: 'Updated customer profile with profile photo.' })
  async uploadProfilePhoto(
    @Param('id') id: string,
    @UploadedFile() file?: UploadedProfileImage,
  ) {
    const profilePhoto = profileImageToDataUrl(file);
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (existing) {
      const updated = await this.prisma.user.update({
        where: { id },
        data: { profilePhoto },
      });
      return this.toSafeUser(updated);
    }

    const sampleUser = this.store.users.find((item) => item.id === id);
    if (!sampleUser) {
      throw new NotFoundException(`User ${id} not found`);
    }

    sampleUser.profilePhoto = profilePhoto;
    return sampleUser;
  }
}
