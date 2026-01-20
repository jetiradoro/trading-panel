import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { CreateSymbolDto } from './dto/create-symbol.dto';
import { UpdateSymbolDto } from './dto/update-symbol.dto';
import { CreatePriceHistoryDto } from './dto/create-price-history.dto';
import { UpdatePriceHistoryDto } from './dto/update-price-history.dto';
import { PrismaService } from '../prisma/prisma.service';
import { symbols } from '@prisma/client';
import { MarketProduct } from '../market-data/providers/market-data.provider';
import { MarketDataService } from '../market-data/market-data.service';
import { appendLog } from '../common/utils/log-writer';

/**
 * Servicio para gestionar símbolos de trading (crypto, stocks)
 */
@Injectable()
export class SymbolsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly marketDataService: MarketDataService,
  ) {}

  /**
   * Crear un nuevo símbolo
   * @throws ConflictException si el código ya existe
   */
  async create(
    data: CreateSymbolDto,
    userId: string,
    accountId: string,
  ): Promise<symbols> {
    const existing = await this.prisma.symbols.findUnique({
      where: {
        accountId_code: {
          accountId,
          code: data.code,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        `Symbol with code ${data.code} already exists`,
      );
    }

    const last = await this.prisma.symbols.aggregate({
      where: { userId, accountId },
      _max: { sortOrder: true },
    });
    const nextSortOrder = (last._max.sortOrder ?? -1) + 1;

    return this.prisma.symbols.create({
      data: {
        ...data,
        userId,
        accountId,
        sortOrder: nextSortOrder,
      },
    });
  }

  /**
   * Listar todos los símbolos
   */
  findAll(userId: string, accountId: string): Promise<symbols[]> {
    return this.prisma.symbols.findMany({
      where: { userId, accountId },
      orderBy: [{ sortOrder: 'asc' }, { code: 'asc' }],
    });
  }

  /**
   * Buscar símbolos por texto (código o nombre)
   */
  async search(
    query: string,
    userId: string,
    accountId: string,
  ): Promise<symbols[]> {
    return this.prisma.symbols.findMany({
      where: {
        userId,
        accountId,
        OR: [{ code: { contains: query } }, { name: { contains: query } }],
      },
      orderBy: [{ sortOrder: 'asc' }, { code: 'asc' }],
    });
  }

  /**
   * Reordenar símbolos por lista de IDs
   * @throws NotFoundException si algún símbolo no pertenece a la cuenta
   */
  async reorderSymbols(
    userId: string,
    accountId: string,
    ids: string[],
  ): Promise<void> {
    const symbolsFound = await this.prisma.symbols.findMany({
      where: { userId, accountId, id: { in: ids } },
      select: { id: true },
    });

    if (symbolsFound.length !== ids.length) {
      throw new NotFoundException(
        'Símbolos no encontrados o fuera de la cuenta activa',
      );
    }

    await this.prisma.$transaction(
      ids.map((id, index) =>
        this.prisma.symbols.update({
          where: { id },
          data: { sortOrder: index },
        }),
      ),
    );
  }

  /**
   * Buscar símbolo por ID
   * @throws NotFoundException si no existe
   */
  async findOne(
    id: string,
    userId: string,
    accountId: string,
  ): Promise<symbols> {
    const symbol = await this.prisma.symbols.findFirst({
      where: { id, userId, accountId },
    });

    if (!symbol) {
      throw new NotFoundException(`Symbol with id ${id} not found`);
    }

    return symbol;
  }

  /**
   * Buscar símbolo por código
   */
  findByCode(
    code: string,
    userId: string,
    accountId: string,
  ): Promise<symbols | null> {
    return this.prisma.symbols.findFirst({
      where: { code, userId, accountId },
    });
  }

  /**
   * Actualizar símbolo
   * @throws NotFoundException si no existe
   */
  async update(
    id: string,
    data: UpdateSymbolDto,
    userId: string,
    accountId: string,
  ): Promise<symbols> {
    await this.findOne(id, userId, accountId);

    if (data.code) {
      const existing = await this.prisma.symbols.findFirst({
        where: { code: data.code, id: { not: id }, userId, accountId },
      });

      if (existing) {
        throw new ConflictException(
          `Symbol with code ${data.code} already exists`,
        );
      }
    }

    return this.prisma.symbols.update({
      where: { id },
      data,
    });
  }

  /**
   * Eliminar símbolo
   * @throws NotFoundException si no existe
   */
  async remove(
    id: string,
    userId: string,
    accountId: string,
  ): Promise<symbols> {
    await this.findOne(id, userId, accountId);
    return this.prisma.symbols.delete({ where: { id } });
  }

  /**
   * Agregar precio al historial del símbolo
   */
  async addPrice(
    symbolId: string,
    data: CreatePriceHistoryDto,
    userId: string,
    accountId: string,
  ): Promise<any> {
    await this.findOne(symbolId, userId, accountId);

    return this.prisma.price_history.create({
      data: {
        symbolId,
        userId,
        accountId,
        price: data.price,
        date: new Date(data.date),
      },
    });
  }

  /**
   * Obtener historial de precios del símbolo
   */
  async getPrices(
    symbolId: string,
    userId: string,
    accountId: string,
  ): Promise<any[]> {
    await this.findOne(symbolId, userId, accountId);

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    return this.prisma.price_history.findMany({
      where: {
        symbolId,
        userId,
        accountId,
        date: { gte: oneYearAgo },
      },
      orderBy: { date: 'desc' },
    });
  }

  /**
   * Actualizar precio del historial
   */
  async updatePrice(
    symbolId: string,
    priceId: string,
    data: UpdatePriceHistoryDto,
    userId: string,
    accountId: string,
  ): Promise<any> {
    const price = await this.prisma.price_history.findUnique({
      where: { id: priceId },
    });

    if (
      !price ||
      price.symbolId !== symbolId ||
      price.userId !== userId ||
      price.accountId !== accountId
    ) {
      throw new NotFoundException(`Price with id ${priceId} not found`);
    }

    const updateData: any = {};
    if (data.price !== undefined) {
      updateData.price = data.price;
    }
    if (data.date) {
      updateData.date = new Date(data.date);
    }

    return this.prisma.price_history.update({
      where: { id: priceId },
      data: updateData,
    });
  }

  /**
   * Eliminar precio del historial
   */
  async removePrice(
    symbolId: string,
    priceId: string,
    userId: string,
    accountId: string,
  ): Promise<any> {
    const price = await this.prisma.price_history.findUnique({
      where: { id: priceId },
    });

    if (
      !price ||
      price.symbolId !== symbolId ||
      price.userId !== userId ||
      price.accountId !== accountId
    ) {
      throw new NotFoundException(`Price with id ${priceId} not found`);
    }

    return this.prisma.price_history.delete({
      where: { id: priceId },
    });
  }

  /**
   * Forzar sincronizacion manual del precio del simbolo
   */
  async priceMarketSync(symbolId: string): Promise<any> {
    const symbol = await this.prisma.symbols.findUnique({
      where: { id: symbolId },
    });

    if (!symbol) {
      throw new NotFoundException(`Symbol with id ${symbolId} not found`);
    }

    if (!symbol.marketCode) {
      throw new BadRequestException('Market code no configurado');
    }

    const quote = await this.marketDataService.getLatestPrice(
      symbol.marketCode,
      symbol.product as MarketProduct,
      symbol.marketProvider,
      { exchange: symbol.marketExchange || undefined },
    );

    if (!quote) {
      await this.prisma.symbols.update({
        where: { id: symbol.id },
        data: { marketSyncStatus: 'ok', marketSyncError: null },
      });
      return { success: false, skipped: true, reason: 'empty' };
    }

    const existing = await this.prisma.price_history.findFirst({
      where: {
        symbolId: symbol.id,
        date: quote.date,
        price: quote.price,
      },
    });

    if (existing) {
      await this.prisma.symbols.update({
        where: { id: symbol.id },
        data: { marketSyncStatus: 'ok', marketSyncError: null },
      });
      return { success: false, skipped: true, reason: 'duplicate' };
    }

    const created = await this.prisma.price_history.create({
      data: {
        symbolId: symbol.id,
        userId: symbol.userId,
        accountId: symbol.accountId,
        price: quote.price,
        date: quote.date,
      },
    });

    await this.prisma.symbols.update({
      where: { id: symbol.id },
      data: { marketSyncStatus: 'ok', marketSyncError: null },
    });

    return created;
  }

  /**
   * Sincroniza precios de simbolos en operaciones abiertas.
   */
  async syncOpenOperationsMarketPrices(): Promise<void> {
    const openOperations = await this.prisma.operations.findMany({
      where: { status: 'open' },
      select: { symbolId: true },
    });

    const symbolIds = Array.from(
      new Set(openOperations.map((o) => o.symbolId)),
    );
    if (!symbolIds.length) return;

    const symbolsToSync = await this.prisma.symbols.findMany({
      where: {
        id: { in: symbolIds },
        marketCode: { not: null },
        marketProvider: { not: null },
      },
    });

    for (const symbol of symbolsToSync) {
      try {
        await this.priceMarketSync(symbol.id);
      } catch (error: any) {
        const message =
          error?.response?.data?.message || error?.message || 'Unknown error';

        await this.prisma.symbols.update({
          where: { id: symbol.id },
          data: { marketSyncStatus: 'error', marketSyncError: message },
        });

        await appendLog(
          'market_sync_errors.log',
          `ERROR symbolId=${symbol.id} symbolCode=${symbol.code} marketCode=${symbol.marketCode} message="${message}"`,
        );
      }
    }
  }
}
