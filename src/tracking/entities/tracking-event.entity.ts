import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { OrderStatus } from '../../orders/entities/order-status.enum';

@Entity('tracking_events')
export class TrackingEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  orderId: string;

  @Column({ type: 'enum', enum: OrderStatus })
  status: OrderStatus;

  @Column({ length: 300 })
  description: string;

  @Column({ length: 150, nullable: true })
  location: string;

  @Column({ nullable: true })
  operatorId: string;

  @CreateDateColumn()
  createdAt: Date;

  // ─── Relaciones ────────────────────────────────────────────────────────────
  @ManyToOne(() => Order, (order) => order.trackingEvents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order;
}
