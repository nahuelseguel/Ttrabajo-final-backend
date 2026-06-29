import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrackingService } from './tracking.service';
import { TrackingController } from './tracking.controller';
import { TrackingEvent } from './entities/tracking-event.entity';

@Module({
  imports:     [TypeOrmModule.forFeature([TrackingEvent])],
  controllers: [TrackingController],
  providers:   [TrackingService],
  exports:     [TrackingService],
})
export class TrackingModule {}
