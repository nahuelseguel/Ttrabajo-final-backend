import {
  Controller, Get, Post, Body, Patch, Param, Delete,
  UseGuards, ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { CurrentUser } from '../common/current-user.decorator';

//endpoints
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // POST /api/v1/orders
  @Post()
  create(@Body() dto: CreateOrderDto, @CurrentUser() user: any) {
    return this.ordersService.create(dto, user);
  }

  // GET /api/v1/orders  →  admin/operator ven todo, client solo los suyos
  @Get()
  findAll(@CurrentUser() user: any) {
    return this.ordersService.findAll(user);
  }

  // GET /api/v1/orders/track/:code  →  público (sin guardia aplicado aquí, ver módulo)
  @Get('track/:code')
  findByCode(@Param('code') code: string) {
    return this.ordersService.findByTrackingCode(code);
  }

  // GET /api/v1/orders/:id
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.findOne(id);
  }

  // PATCH /api/v1/orders/:id  →  admin y operator cambian estado, client solo notas
  @Patch(':id')
  @Roles('admin', 'operator')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrderDto,
    @CurrentUser() user: any,
  ) {
    return this.ordersService.update(id, dto, user);
  }

  // DELETE /api/v1/orders/:id  →  solo ADMIN
  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.remove(id);
  }
}
