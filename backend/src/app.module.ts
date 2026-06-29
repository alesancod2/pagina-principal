import { Module, Controller, Get } from '@nestjs/common';

@Controller('health')
class HealthController {
  @Get()
  check() {
    return { status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0', service: 'AutoVale API' };
  }
}

@Module({
  controllers: [HealthController],
})
export class AppModule {}
