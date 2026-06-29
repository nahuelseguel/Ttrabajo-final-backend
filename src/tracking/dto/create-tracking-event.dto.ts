import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { OrderStatus } from '../../orders/entities/order-status.enum';

export class CreateTrackingEventDto {
  @IsUUID()
  @IsNotEmpty()
  orderId: string;

  @IsEnum(OrderStatus)
  status: OrderStatus;

  @IsNotEmpty()
  @IsString()
  @MaxLength(300)
  description: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  location?: string;
}
