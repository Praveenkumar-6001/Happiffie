import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AdminModule } from './modules/admin/admin.module';
import { AiModule } from './modules/ai/ai.module';
import { AuthModule } from './modules/auth/auth.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { CommonModule } from './common/common.module';
import { InvitationsModule } from './modules/invitations/invitations.module';
import { MatchingModule } from './modules/matching/matching.module';
import { RequirementsModule } from './modules/requirements/requirements.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { UsersModule } from './modules/users/users.module';
import { VendorsModule } from './modules/vendors/vendors.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CommonModule,
    AiModule,
    AuthModule,
    UsersModule,
    VendorsModule,
    RequirementsModule,
    MatchingModule,
    InvitationsModule,
    BookingsModule,
    ReviewsModule,
    AdminModule,
  ],
})
export class AppModule {}
