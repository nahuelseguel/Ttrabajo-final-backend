import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { OrderStatus } from '../entities/order-status.enum';

export class CreateOrderDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(150)
  originName: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(300)
  originAddress: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  originCity: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(150)
  destinationName: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(300)
  destinationAddress: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  destinationCity: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  destinationPhone: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  weightKg?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => Boolean(value))
  fragile?: boolean;
}
