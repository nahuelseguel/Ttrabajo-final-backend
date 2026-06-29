import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderStatus } from './entities/order-status.enum';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { TrackingService } from '../tracking/tracking.service';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    private readonly trackingService: TrackingService,
  ) {}

  async create(dto: CreateOrderDto, client: User): Promise<Order> {
    const count       = await this.orderRepo.count();
    const trackingCode = `LOG-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;

    const order = this.orderRepo.create({ ...dto, trackingCode, clientId: client.id });
    const saved = await this.orderRepo.save(order);

    await this.trackingService.create({
      orderId:     saved.id,
      status:      OrderStatus.PENDING,
      description: 'Pedido creado',
    });

    return this.findOne(saved.id);
  }

  async findAll(user: User): Promise<Order[]> {
    const where = user.role === UserRole.CLIENT ? { clientId: user.id } : {};
    return this.orderRepo.find({
      where,
      relations: ['client', 'trackingEvents'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['client', 'trackingEvents'],
    });
    if (!order) throw new NotFoundException(`Pedido ${id} no encontrado`);
    return order;
  }

  async findByTrackingCode(code: string): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { trackingCode: code.toUpperCase() },
      relations: ['trackingEvents'],
    });
    if (!order) throw new NotFoundException(`Código ${code} no encontrado`);
    return order;
  }

  async update(id: string, dto: UpdateOrderDto, user: User): Promise<Order> {
    const order = await this.findOne(id);

    if (user.role === UserRole.CLIENT && order.clientId !== user.id) {
      throw new ForbiddenException('No tenés acceso a este pedido');
    }

    const prevStatus = order.status;
    Object.assign(order, dto);
    await this.orderRepo.save(order);

    if (dto.status && dto.status !== prevStatus) {
      await this.trackingService.create({
        orderId:     order.id,
        status:      dto.status,
        description: `Estado actualizado a ${dto.status}`,
        operatorId:  user.id,
      });
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.orderRepo.delete(id);
  }
}
