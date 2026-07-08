import { Global, Module } from '@nestjs/common';
import { SampleStoreService } from './sample-store.service';

@Global()
@Module({
  providers: [SampleStoreService],
  exports: [SampleStoreService],
})
export class CommonModule {}
