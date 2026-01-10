import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SymbolsService } from './symbols.service';
import { CreateSymbolDto } from './dto/create-symbol.dto';
import { UpdateSymbolDto } from './dto/update-symbol.dto';
import { CreatePriceHistoryDto } from './dto/create-price-history.dto';
import { UpdatePriceHistoryDto } from './dto/update-price-history.dto';
import { AuthGuard } from '../auth/guards/auth.guard';

/**
 * Controlador para gestionar símbolos de trading
 */
@Controller('symbols')
@UseGuards(AuthGuard)
export class SymbolsController {
  constructor(private readonly service: SymbolsService) {}

  @Post()
  create(@Body() data: CreateSymbolDto) {
    return this.service.create(data);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('search')
  search(@Query('q') query: string) {
    return this.service.search(query || '');
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: UpdateSymbolDto) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  // Endpoints para historial de precios
  @Post(':id/prices')
  addPrice(@Param('id') symbolId: string, @Body() data: CreatePriceHistoryDto) {
    return this.service.addPrice(symbolId, data);
  }

  @Get(':id/prices')
  getPrices(@Param('id') symbolId: string) {
    return this.service.getPrices(symbolId);
  }

  @Put(':id/prices/:priceId')
  updatePrice(
    @Param('id') symbolId: string,
    @Param('priceId') priceId: string,
    @Body() data: UpdatePriceHistoryDto,
  ) {
    return this.service.updatePrice(symbolId, priceId, data);
  }

  @Delete(':id/prices/:priceId')
  removePrice(@Param('id') symbolId: string, @Param('priceId') priceId: string) {
    return this.service.removePrice(symbolId, priceId);
  }
}
