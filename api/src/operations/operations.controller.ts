import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OperationsService } from './operations.service';
import { CreateOperationDto } from './dto/create-operation.dto';
import { CreateEntryDto } from './dto/create-entry.dto';
import { CreatePriceHistoryDto } from './dto/create-price-history.dto';
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

  @Post(':id/entries')
  addEntry(@Param('id') id: string, @Body() data: CreateEntryDto) {
    return this.service.addEntry(id, data);
  }

  @Delete(':id/entries/:entryId')
  removeEntry(@Param('id') id: string, @Param('entryId') entryId: string) {
    return this.service.removeEntry(id, entryId);
  }

  @Post(':id/prices')
  addPrice(@Param('id') id: string, @Body() data: CreatePriceHistoryDto) {
    return this.service.addPrice(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
