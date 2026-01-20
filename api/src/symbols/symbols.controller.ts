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
  HttpException,
} from '@nestjs/common';
import { SymbolsService } from './symbols.service';
import { CreateSymbolDto } from './dto/create-symbol.dto';
import { UpdateSymbolDto } from './dto/update-symbol.dto';
import { CreatePriceHistoryDto } from './dto/create-price-history.dto';
import { UpdatePriceHistoryDto } from './dto/update-price-history.dto';
import { ReorderSymbolsDto } from './dto/reorder-symbols.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AppClient } from '../common/decorators/app-client.decorator';
import { users } from '@prisma/client';
import { AccountsService } from '../accounts/accounts.service';

/**
 * Controlador para gestionar símbolos de trading
 */
@Controller('symbols')
@UseGuards(AuthGuard)
export class SymbolsController {
  constructor(
    private readonly service: SymbolsService,
    private readonly accountsService: AccountsService,
  ) {}

  @Post()
  async create(@AppClient() user: users, @Body() data: CreateSymbolDto) {
    const account = await this.accountsService.findCurrentAccount(user.id);
    if (!account) {
      throw new HttpException('No active account found', 400);
    }
    return this.service.create(data, user.id, account.id);
  }

  @Get()
  async findAll(@AppClient() user: users) {
    const account = await this.accountsService.findCurrentAccount(user.id);
    if (!account) {
      throw new HttpException('No active account found', 400);
    }
    return this.service.findAll(user.id, account.id);
  }

  @Get('search')
  async search(@AppClient() user: users, @Query('q') query: string) {
    const account = await this.accountsService.findCurrentAccount(user.id);
    if (!account) {
      throw new HttpException('No active account found', 400);
    }
    return this.service.search(query || '', user.id, account.id);
  }

  @Get(':id')
  async findOne(@AppClient() user: users, @Param('id') id: string) {
    const account = await this.accountsService.findCurrentAccount(user.id);
    if (!account) {
      throw new HttpException('No active account found', 400);
    }
    return this.service.findOne(id, user.id, account.id);
  }

  @Put('reorder')
  async reorder(@AppClient() user: users, @Body() data: ReorderSymbolsDto) {
    const account = await this.accountsService.findCurrentAccount(user.id);
    if (!account) {
      throw new HttpException('No active account found', 400);
    }
    await this.service.reorderSymbols(user.id, account.id, data.ids);
    return { success: true };
  }

  @Put(':id')
  async update(
    @AppClient() user: users,
    @Param('id') id: string,
    @Body() data: UpdateSymbolDto,
  ) {
    const account = await this.accountsService.findCurrentAccount(user.id);
    if (!account) {
      throw new HttpException('No active account found', 400);
    }
    return this.service.update(id, data, user.id, account.id);
  }

  @Delete(':id')
  async remove(@AppClient() user: users, @Param('id') id: string) {
    const account = await this.accountsService.findCurrentAccount(user.id);
    if (!account) {
      throw new HttpException('No active account found', 400);
    }
    return this.service.remove(id, user.id, account.id);
  }

  @Post(':id/market-sync')
  async manualMarketSync(@AppClient() user: users, @Param('id') id: string) {
    const account = await this.accountsService.findCurrentAccount(user.id);
    if (!account) {
      throw new HttpException('No active account found', 400);
    }
    await this.service.findOne(id, user.id, account.id);
    return this.service.priceMarketSync(id);
  }

  // Endpoints para historial de precios
  @Post(':id/prices')
  async addPrice(
    @AppClient() user: users,
    @Param('id') symbolId: string,
    @Body() data: CreatePriceHistoryDto,
  ) {
    const account = await this.accountsService.findCurrentAccount(user.id);
    if (!account) {
      throw new HttpException('No active account found', 400);
    }
    return this.service.addPrice(symbolId, data, user.id, account.id);
  }

  @Get(':id/prices')
  async getPrices(@AppClient() user: users, @Param('id') symbolId: string) {
    const account = await this.accountsService.findCurrentAccount(user.id);
    if (!account) {
      throw new HttpException('No active account found', 400);
    }
    return this.service.getPrices(symbolId, user.id, account.id);
  }

  @Put(':id/prices/:priceId')
  async updatePrice(
    @AppClient() user: users,
    @Param('id') symbolId: string,
    @Param('priceId') priceId: string,
    @Body() data: UpdatePriceHistoryDto,
  ) {
    const account = await this.accountsService.findCurrentAccount(user.id);
    if (!account) {
      throw new HttpException('No active account found', 400);
    }
    return this.service.updatePrice(symbolId, priceId, data, user.id, account.id);
  }

  @Delete(':id/prices/:priceId')
  async removePrice(
    @AppClient() user: users,
    @Param('id') symbolId: string,
    @Param('priceId') priceId: string,
  ) {
    const account = await this.accountsService.findCurrentAccount(user.id);
    if (!account) {
      throw new HttpException('No active account found', 400);
    }
    return this.service.removePrice(symbolId, priceId, user.id, account.id);
  }
}
