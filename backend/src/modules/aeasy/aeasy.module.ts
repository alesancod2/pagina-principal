import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AEasyService } from './aeasy.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000, // 10 segundos timeout
      maxRedirects: 3,
    }),
  ],
  providers: [AEasyService],
  exports: [AEasyService],
})
export class AEasyModule {}
