import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './users/entities/user.entity';
import { Order } from './orders/entities/order.entity';
import { OrderStatus } from './orders/entities/order-status.enum';
import { TrackingEvent } from './tracking/entities/tracking-event.entity';

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'logistics',
    entities: [User, Order, TrackingEvent],
    synchronize: true,
  });

  await dataSource.initialize();

  const userRepo = dataSource.getRepository(User);
  const orderRepo = dataSource.getRepository(Order);
  const trackingRepo = dataSource.getRepository(TrackingEvent);

  // ─── Limpiar datos existentes ─────────────────────────────────────────────
  await dataSource.query('TRUNCATE TABLE "tracking_events" CASCADE');
  await dataSource.query('TRUNCATE TABLE "orders" CASCADE');
  await dataSource.query('TRUNCATE TABLE "users" CASCADE');

  // ─── Usuarios ─────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('123456', 10);

  const usersData = [
    { firstName: 'Martín',    lastName: 'González',  email: 'martin.gonzalez@logistica.com',  role: UserRole.ADMIN },
    { firstName: 'Lucía',     lastName: 'Rodríguez', email: 'lucia.rodriguez@logistica.com',   role: UserRole.ADMIN },
    { firstName: 'Juan',      lastName: 'Pérez',     email: 'juan.perez@logistica.com',        role: UserRole.ADMIN },
    { firstName: 'Carla',     lastName: 'Martínez',  email: 'carla.martinez@logistica.com',    role: UserRole.OPERATOR },
    { firstName: 'Diego',     lastName: 'Fernández', email: 'diego.fernandez@logistica.com',   role: UserRole.OPERATOR },
    { firstName: 'Paula',     lastName: 'López',     email: 'paula.lopez@logistica.com',       role: UserRole.OPERATOR },
    { firstName: 'Santiago',  lastName: 'Díaz',      email: 'santiago.diaz@email.com',         role: UserRole.CLIENT },
    { firstName: 'Valentina', lastName: 'Torres',    email: 'valentina.torres@email.com',      role: UserRole.CLIENT },
    { firstName: 'Nicolás',   lastName: 'Castro',    email: 'nicolas.castro@email.com',        role: UserRole.CLIENT },
    { firstName: 'Florencia', lastName: 'Álvarez',   email: 'florencia.alvarez@email.com',     role: UserRole.CLIENT },
  ];

  const savedUsers = await userRepo.save(
    usersData.map((u) => userRepo.create({ ...u, password: passwordHash, isActive: true })),
  );

  const adminUsers = savedUsers.filter((u) => u.role === UserRole.ADMIN);
  const operatorUsers = savedUsers.filter((u) => u.role === UserRole.OPERATOR);
  const clientUsers = savedUsers.filter((u) => u.role === UserRole.CLIENT);

  console.log(`✓ ${savedUsers.length} usuarios creados`);

  // ─── Órdenes / Paquetes ──────────────────────────────────────────────────
  const ordersData = [
    {
      trackingCode: 'LOG-2024-000001',
      originName: 'Depósito Central',
      originAddress: 'Av. Corrientes 1234',
      originCity: 'CABA',
      destinationName: 'Oficina Córdoba',
      destinationAddress: 'Av. Colón 567',
      destinationCity: 'Córdoba',
      destinationPhone: '+54 351 123-4567',
      weightKg: 5.2,
      description: 'Caja de herramientas industriales',
      fragile: true,
      status: OrderStatus.IN_TRANSIT,
      clientId: clientUsers[0].id,
    },
    {
      trackingCode: 'LOG-2024-000002',
      originName: 'Librería El Ateneo',
      originAddress: 'Av. Pellegrini 890',
      originCity: 'Rosario',
      destinationName: 'Biblioteca UNLP',
      destinationAddress: 'Calle 50 789',
      destinationCity: 'La Plata',
      destinationPhone: '+54 221 987-6543',
      weightKg: 3.8,
      description: 'Libros de texto universitarios',
      fragile: false,
      status: OrderStatus.CONFIRMED,
      clientId: clientUsers[1].id,
    },
    {
      trackingCode: 'LOG-2024-000003',
      originName: 'Tienda Deportiva Goal',
      originAddress: 'Av. San Martín 234',
      originCity: 'Mendoza',
      destinationName: 'Club Atlético Tucumán',
      destinationAddress: 'Av. Independencia 456',
      destinationCity: 'San Miguel de Tucumán',
      destinationPhone: '+54 381 555-1212',
      weightKg: 2.1,
      description: 'Ropa deportiva',
      fragile: false,
      status: OrderStatus.PENDING,
      clientId: clientUsers[2].id,
    },
    {
      trackingCode: 'LOG-2024-000004',
      originName: 'Estudio Contable Asociados',
      originAddress: 'Av. Colón 1234',
      originCity: 'Mar del Plata',
      destinationName: 'Estudio Jurídico Salta',
      destinationAddress: 'Av. Belgrano 567',
      destinationCity: 'Salta',
      destinationPhone: '+54 387 444-5678',
      weightKg: 0.5,
      description: 'Documentación contable',
      fragile: true,
      status: OrderStatus.DELIVERED,
      clientId: clientUsers[3].id,
    },
    {
      trackingCode: 'LOG-2024-000005',
      originName: 'Autopartes El Norte',
      originAddress: 'Av. Aristóbulo del Valle 345',
      originCity: 'Santa Fe',
      destinationName: 'Taller Mecánico Corrientes',
      destinationAddress: 'Av. 3 de Abril 123',
      destinationCity: 'Corrientes',
      destinationPhone: '+54 379 333-9876',
      weightKg: 8.7,
      description: 'Repuestos de automóvil',
      fragile: false,
      status: OrderStatus.IN_TRANSIT,
      clientId: clientUsers[0].id,
    },
    {
      trackingCode: 'LOG-2024-000006',
      originName: 'Electrodomésticos Buenos Aires',
      originAddress: 'Av. Cabildo 2000',
      originCity: 'CABA',
      destinationName: 'Local Belgrano',
      destinationAddress: 'Av. del Libertador 1500',
      destinationCity: 'CABA',
      destinationPhone: '+54 11 4777-1234',
      weightKg: 4.5,
      description: 'Equipo de música',
      fragile: true,
      status: OrderStatus.PENDING,
      clientId: clientUsers[1].id,
    },
  ];

  const savedOrders = await orderRepo.save(
    ordersData.map((o) => orderRepo.create(o)),
  );

  console.log(`✓ ${savedOrders.length} órdenes/paquetes creados`);

  // ─── Eventos de Tracking ──────────────────────────────────────────────────
  const trackingEventsData: Partial<TrackingEvent>[] = [];

  for (const order of savedOrders) {
    trackingEventsData.push({
      orderId: order.id,
      status: order.status,
      description: getTrackingDescription(order.status),
      location: order.originCity,
      operatorId: operatorUsers[0].id,
    });

    if (order.status === OrderStatus.IN_TRANSIT) {
      trackingEventsData.push({
        orderId: order.id,
        status: OrderStatus.CONFIRMED,
        description: 'Paquete recibido y procesado en origen',
        location: order.originCity,
        operatorId: operatorUsers[1 % operatorUsers.length].id,
      });
    }

    if (order.status === OrderStatus.DELIVERED) {
      trackingEventsData.push(
        {
          orderId: order.id,
          status: OrderStatus.CONFIRMED,
          description: 'Paquete recibido y procesado en origen',
          location: order.originCity,
          operatorId: operatorUsers[0].id,
        },
        {
          orderId: order.id,
          status: OrderStatus.IN_TRANSIT,
          description: 'Paquete en tránsito al destino',
          location: 'En ruta',
          operatorId: operatorUsers[1].id,
        },
        {
          orderId: order.id,
          status: OrderStatus.DELIVERED,
          description: 'Paquete entregado al destinatario',
          location: order.destinationCity,
          operatorId: operatorUsers[2].id,
        },
      );
    }
  }

  await trackingRepo.save(trackingEventsData.map((e) => trackingRepo.create(e)));

  console.log(`✓ ${trackingEventsData.length} eventos de tracking creados`);
  console.log('\n🚀 Seed completado exitosamente.');
  console.log('\nUsuarios creados (contraseña: 123456):');
  for (const u of savedUsers) {
    console.log(`  ${u.role.padEnd(10)} ${u.email}`);
  }

  await dataSource.destroy();
}

function getTrackingDescription(status: OrderStatus): string {
  const descriptions: Record<OrderStatus, string> = {
    [OrderStatus.PENDING]:    'Pedido registrado en el sistema',
    [OrderStatus.CONFIRMED]:  'Paquete recibido y procesado en origen',
    [OrderStatus.IN_TRANSIT]: 'Paquete en tránsito al destino',
    [OrderStatus.DELIVERED]:  'Paquete entregado al destinatario',
    [OrderStatus.CANCELLED]:  'Pedido cancelado',
  };
  return descriptions[status];
}

seed().catch((err) => {
  console.error('Error en seed:', err);
  process.exit(1);
});
