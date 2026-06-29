import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { TrackingEvent } from '../../tracking/entities/tracking-event.entity';
import { OrderStatus } from './order-status.enum';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 20 })
  trackingCode: string;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  // ─── Origen ────────────────────────────────────────────────────────────────
  @Column({ length: 150 })
  originName: string;

  @Column({ length: 300 })
  originAddress: string;

  @Column({ length: 100 })
  originCity: string;

  // ─── Destino ───────────────────────────────────────────────────────────────
  @Column({ length: 150 })
  destinationName: string;

  @Column({ length: 300 })
  destinationAddress: string;

  @Column({ length: 100 })
  destinationCity: string;

  @Column({ length: 20 })
  destinationPhone: string;

  // ─── Paquete ───────────────────────────────────────────────────────────────
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weightKg: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'boolean', default: false })
  fragile: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // ─── Relaciones ────────────────────────────────────────────────────────────
  @Column({ nullable: true })
  clientId: string;

  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: 'clientId' })
  client: User;

  @OneToMany(() => TrackingEvent, (event) => event.order, { cascade: true })
  trackingEvents: TrackingEvent[];
}
