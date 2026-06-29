import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { OrdersModule } from './orders/orders.module';
import { TrackingModule } from './tracking/tracking.module';
import { User } from './users/entities/user.entity';
import { Order } from './orders/entities/order.entity';
import { TrackingEvent } from './tracking/entities/tracking-event.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host:     config.get('DB_HOST'),
        port:     config.get<number>('DB_PORT'),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        entities: [User, Order, TrackingEvent],
        synchronize: true, // solo desarrollo — genera tablas automáticamente
      }),
    }),

    AuthModule,
    UsersModule,
    OrdersModule,
    TrackingModule,
  ],
})
export class AppModule {}
