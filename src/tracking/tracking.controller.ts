import {
  Controller, Get, Post, Body, Param,
  UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { TrackingService } from './tracking.service';
import { CreateTrackingEventDto } from './dto/create-tracking-event.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { CurrentUser } from '../common/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tracking')
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  // POST /api/v1/tracking  →  ADMIN y OPERATOR
  @Post()
  @Roles('admin', 'operator')
  create(@Body() dto: CreateTrackingEventDto, @CurrentUser() user: any) {
    return this.trackingService.create({ ...dto, operatorId: user.id });
  }

  // GET /api/v1/tracking/order/:orderId
  @Get('order/:orderId')
  findByOrder(@Param('orderId', ParseUUIDPipe) orderId: string) {
    return this.trackingService.findByOrder(orderId);
  }

  // GET /api/v1/tracking/:id
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.trackingService.findOne(id);
  }
}
