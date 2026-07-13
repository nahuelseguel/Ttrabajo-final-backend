# LogiTrack — Backend

API REST para gestión de logística y trazabilidad de pedidos, construida con **NestJS**, **TypeORM** y **PostgreSQL**.

---

## Tabla de contenidos

1. [Requisitos previos](#requisitos-previos)
2. [Instalación](#instalación)
3. [Variables de entorno](#variables-de-entorno)
4. [Base de datos y tablas](#base-de-datos-y-tablas)
5. [Ejecución](#ejecución)
6. [Estructura del proyecto](#estructura-del-proyecto)
7. [Endpoints disponibles](#endpoints-disponibles)
8. [Roles y permisos](#roles-y-permisos)
9. [Ejemplos de uso](#ejemplos-de-uso)

---

## Requisitos previos

Antes de comenzar, asegurate de tener instalado:

| Herramienta | Versión mínima | Cómo verificar         |
|-------------|---------------|------------------------|
| Node.js     | 18.x          | `node -v`              |
| npm         | 9.x           | `npm -v`               |
| PostgreSQL  | 14.x          | `psql --version`       |

---

## Instalación

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd logistics-backend
```

### 2. Instalar dependencias

```bash
npm install
```

---

## Variables de entorno

### 1. Crear el archivo `.env`

Copiá el archivo de ejemplo y completá los valores:

```bash
cp .env.example .env
```

### 2. Contenido del `.env`

```env
# ── Base de datos ──────────────────────────────────────
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=supabaseqw12
DB_NAME=logistics_db

# ── JWT ────────────────────────────────────────────────
# Usar una cadena larga y aleatoria (mínimo 32 caracteres)
JWT_SECRET=cambia_este_secreto_en_produccion
JWT_EXPIRES_IN=7d

# ── Seguridad ──────────────────────────────────────────
# Costo del hash bcrypt. En desarrollo puede ser 10, en producción 12+
BCRYPT_ROUNDS=10

# ── Servidor ───────────────────────────────────────────
PORT=3000
```

> **⚠️ Importante:** el archivo `.env` está en `.gitignore` y nunca debe subirse al repositorio.

---

## Base de datos y tablas

### 1. Crear la base de datos en PostgreSQL

Conectate a PostgreSQL y ejecutá:

```sql
CREATE DATABASE logistics_db;
```

O desde la terminal:

```bash
psql -U postgres -c "CREATE DATABASE logistics_db;"
```

### 2. Generación automática de tablas (synchronize)

Este proyecto usa `synchronize: true` de TypeORM en modo desarrollo. Esto significa que **al iniciar la aplicación por primera vez, TypeORM crea automáticamente todas las tablas** según las entidades definidas.

Las tablas que se generan son:

| Tabla            | Descripción                                      |
|------------------|--------------------------------------------------|
| `users`          | Usuarios del sistema (clientes, operadores, admins) |
| `orders`         | Pedidos con origen, destino y estado             |
| `tracking_events`| Historial de eventos de trazabilidad por pedido  |

> **⚠️ Producción:** en un entorno productivo, cambiar `synchronize: false` y utilizar migraciones de TypeORM en su lugar para tener control sobre los cambios de esquema.

### 3. Crear un usuario administrador (seed manual)

El sistema no incluye un seed automático. Para crear el primer usuario administrador, registrarlo normalmente y luego actualizar su rol directamente en la base de datos:

```sql
-- Después de registrar el usuario vía /api/v1/auth/register
UPDATE users SET role = 'admin' WHERE email = 'tu@email.com';
```

---

## Ejecución

### Modo desarrollo (con hot reload)

```bash
npm run start:dev
```

La API queda disponible en: `http://localhost:3000/api/v1`

### Modo producción

```bash
npm run build
npm run start:prod
```

---

## Estructura del proyecto

```
src/
├── main.ts                        # Punto de entrada, configuración global
├── app.module.ts                  # Módulo raíz, configuración de BD
│
├── common/                        # Utilidades compartidas
│   ├── current-user.decorator.ts  # Decorador @CurrentUser()
│   ├── http-exception.filter.ts   # Filtro global de errores HTTP
│   ├── roles.decorator.ts         # Decorador @Roles()
│   └── roles.guard.ts             # Guard de autorización por rol
│
├── auth/                          # Autenticación
│   ├── dto/
│   │   ├── login.dto.ts
│   │   └── register.dto.ts
│   ├── auth.controller.ts
│   ├── auth.module.ts
│   ├── auth.service.ts
│   ├── jwt-auth.guard.ts
│   └── jwt.strategy.ts
│
├── users/                         # Gestión de usuarios
│   ├── dto/
│   │   ├── create-user.dto.ts
│   │   └── update-user.dto.ts
│   ├── entities/
│   │   └── user.entity.ts
│   ├── users.controller.ts
│   ├── users.module.ts
│   └── users.service.ts
│
├── orders/                        # Gestión de pedidos
│   ├── dto/
│   │   ├── create-order.dto.ts
│   │   └── update-order.dto.ts
│   ├── entities/
│   │   └── order.entity.ts
│   ├── orders.controller.ts
│   ├── orders.module.ts
│   └── orders.service.ts
│
└── tracking/                      # Trazabilidad
    ├── dto/
    │   └── create-tracking-event.dto.ts
    ├── entities/
    │   └── tracking-event.entity.ts
    ├── tracking.controller.ts
    ├── tracking.module.ts
    └── tracking.service.ts
```

---

## Endpoints disponibles

Todos los endpoints tienen el prefijo `/api/v1`.

### Auth

| Método | Ruta               | Acceso  | Descripción                          |
|--------|--------------------|---------|--------------------------------------|
| POST   | `/auth/register`   | Público | Registrar nuevo usuario (rol client) |
| POST   | `/auth/login`      | Público | Iniciar sesión, retorna JWT          |

### Users

| Método | Ruta              | Acceso            | Descripción                       |
|--------|-------------------|-------------------|-----------------------------------|
| GET    | `/users`          | admin, operator   | Listar todos los usuarios         |
| GET    | `/users/me`       | autenticado       | Ver perfil propio                 |
| GET    | `/users/:id`      | admin, operator   | Ver usuario por ID                |
| POST   | `/users`          | admin             | Crear usuario manualmente         |
| PATCH  | `/users/:id`      | admin             | Actualizar usuario                |
| DELETE | `/users/:id`      | admin             | Eliminar usuario                  |

### Orders

| Método | Ruta                    | Acceso            | Descripción                                       |
|--------|-------------------------|-------------------|---------------------------------------------------|
| POST   | `/orders`               | autenticado       | Crear nuevo pedido                                |
| GET    | `/orders`               | autenticado       | Listar pedidos (admin/op: todos, client: propios) |
| GET    | `/orders/track/:code`   | **Público**       | Rastrear pedido por código de seguimiento         |
| GET    | `/orders/:id`           | autenticado       | Ver pedido por ID                                 |
| PATCH  | `/orders/:id`           | admin, operator   | Actualizar pedido o cambiar estado                |
| DELETE | `/orders/:id`           | admin             | Eliminar pedido                                   |

### Tracking

| Método | Ruta                          | Acceso          | Descripción                      |
|--------|-------------------------------|-----------------|----------------------------------|
| POST   | `/tracking`                   | admin, operator | Registrar evento de tracking     |
| GET    | `/tracking/order/:orderId`    | autenticado     | Historial de un pedido           |
| GET    | `/tracking/:id`               | autenticado     | Ver evento por ID                |

---

## Roles y permisos

| Rol        | Descripción                                                  |
|------------|--------------------------------------------------------------|
| `client`   | Se registra solo, ve y crea sus propios pedidos              |
| `operator` | Ve todos los pedidos, registra eventos de tracking           |
| `admin`    | Acceso completo: gestiona usuarios, pedidos y tracking       |

---

## Ejemplos de uso

### Registrar un usuario

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Juan",
    "lastName": "Pérez",
    "email": "juan@ejemplo.com",
    "password": "Segura123!"
  }'
```

**Respuesta:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "juan@ejemplo.com",
    "role": "client"
  }
}
```

### Crear un pedido (requiere token)

```bash
curl -X POST http://localhost:3000/api/v1/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <tu_token>" \
  -d '{
    "originName": "Depósito Central",
    "originAddress": "Av. Industrial 123",
    "originCity": "Rosario",
    "destinationName": "Juan Pérez",
    "destinationAddress": "Calle Falsa 123",
    "destinationCity": "Buenos Aires",
    "destinationPhone": "+5491112345678",
    "description": "Notebook",
    "weightKg": 2.5
  }'
```

### Rastrear un pedido (sin token)

```bash
curl http://localhost:3000/api/v1/orders/track/LOG-2024-000001
```

---

## Manejo de errores

Todas las respuestas de error siguen la misma estructura:

```json
{
  "statusCode": 400,
  "message": "El email ya está registrado",
  "path": "/api/v1/auth/register",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

| Código | Significado                                  |
|--------|----------------------------------------------|
| 400    | Datos inválidos o validación fallida          |
| 401    | No autenticado o token inválido               |
| 403    | Sin permiso para realizar la acción           |
| 404    | Recurso no encontrado                         |
| 409    | Conflicto (ej: email ya registrado)           |
| 500    | Error interno del servidor                    |
