import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrackingEvent } from './entities/tracking-event.entity';
import { CreateTrackingEventDto } from './dto/create-tracking-event.dto';

@Injectable()
export class TrackingService {
  constructor(
    @InjectRepository(TrackingEvent)
    private readonly trackingRepo: Repository<TrackingEvent>,
  ) {}

  async create(dto: CreateTrackingEventDto & { operatorId?: string }): Promise<TrackingEvent> {
    const event = this.trackingRepo.create(dto);
    return this.trackingRepo.save(event);
  }

  async findByOrder(orderId: string): Promise<TrackingEvent[]> {
    return this.trackingRepo.find({
      where: { orderId },
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<TrackingEvent> {
    const event = await this.trackingRepo.findOne({ where: { id } });
    if (!event) throw new NotFoundException(`Evento ${id} no encontrado`);
    return event;
  }
}
