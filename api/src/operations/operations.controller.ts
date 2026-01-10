import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OperationsService } from './operations.service';
import { CreateOperationDto } from './dto/create-operation.dto';
import { CreateEntryDto } from './dto/create-entry.dto';
import { UpdateEntryDto } from './dto/update-entry.dto';
import { UpdateOperationStatusDto } from './dto/update-operation-status.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AppClient } from '../common/decorators/app-client.decorator';
import { users } from '@prisma/client';

/**
 * Controlador para gestionar operaciones de trading
 */
@Controller('operations')
@UseGuards(AuthGuard)
export class OperationsController {
  constructor(private readonly service: OperationsService) {}

  @Post()
  create(@AppClient() user: users, @Body() data: CreateOperationDto) {
    data.userId = user.id;
    return this.service.create(data);
  }

  @Get()
  findAll(
    @AppClient() user: users,
    @Query('status') status?: string,
    @Query('product') product?: string,
    @Query('symbolId') symbolId?: string,
  ) {
    return this.service.findAll({
      userId: user.id,
      status,
      product,
      symbolId,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() data: UpdateOperationStatusDto) {
    return this.service.updateStatus(id, data.status);
  }

  @Post(':id/entries')
  addEntry(@Param('id') id: string, @Body() data: CreateEntryDto) {
    return this.service.addEntry(id, data);
  }

  @Put(':id/entries/:entryId')
  updateEntry(
    @Param('id') id: string,
    @Param('entryId') entryId: string,
    @Body() data: UpdateEntryDto,
  ) {
    return this.service.updateEntry(id, entryId, data);
  }

  @Delete(':id/entries/:entryId')
  removeEntry(@Param('id') id: string, @Param('entryId') entryId: string) {
    return this.service.removeEntry(id, entryId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
