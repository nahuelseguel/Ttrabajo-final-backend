import {
  Controller, Get, Post, Body, Patch, Param, Delete,
  UseGuards, ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { CurrentUser } from '../common/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // POST /api/v1/users  →  solo ADMIN
  @Post()
  @Roles('admin')
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  // GET /api/v1/users  →  ADMIN y OPERATOR
  @Get()
  @Roles('admin', 'operator')
  findAll() {
    return this.usersService.findAll();
  }

  // GET /api/v1/users/me  →  cualquier usuario autenticado
  @Get('me')
  getProfile(@CurrentUser() user: any) {
    return user;
  }

  // GET /api/v1/users/:id  →  ADMIN y OPERATOR
  @Get(':id')
  @Roles('admin', 'operator')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  // PATCH /api/v1/users/:id  →  ADMIN
  @Patch(':id')
  @Roles('admin')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  // DELETE /api/v1/users/:id  →  ADMIN
  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.remove(id);
  }
}
