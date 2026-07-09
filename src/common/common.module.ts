import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { SampleStoreService } from './sample-store.service';

@Global()
@Module({
  providers: [PrismaService, SampleStoreService],
  exports: [PrismaService, SampleStoreService],
})
export class CommonModule {}
