import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateSymbolDto } from './dto/create-symbol.dto';
import { UpdateSymbolDto } from './dto/update-symbol.dto';
import { CreatePriceHistoryDto } from './dto/create-price-history.dto';
import { UpdatePriceHistoryDto } from './dto/update-price-history.dto';
import { PrismaService } from '../prisma/prisma.service';
import { symbols } from '@prisma/client';

/**
 * Servicio para gestionar símbolos de trading (crypto, stocks)
 */
@Injectable()
export class SymbolsService {
  constructor(private readonly prisma: PrismaService) {}

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
      throw new ConflictException(`Symbol with code ${data.code} already exists`);
    }

    return this.prisma.symbols.create({
      data: {
        ...data,
        userId,
        accountId,
      },
    });
  }

  /**
   * Listar todos los símbolos
   */
  findAll(userId: string, accountId: string): Promise<symbols[]> {
    return this.prisma.symbols.findMany({
      where: { userId, accountId },
      orderBy: { code: 'asc' },
    });
  }

  /**
   * Buscar símbolos por texto (código o nombre)
   */
  async search(query: string, userId: string, accountId: string): Promise<symbols[]> {
    return this.prisma.symbols.findMany({
      where: {
        userId,
        accountId,
        OR: [
          { code: { contains: query } },
          { name: { contains: query } },
        ],
      },
      orderBy: { code: 'asc' },
    });
  }

  /**
   * Buscar símbolo por ID
   * @throws NotFoundException si no existe
   */
  async findOne(id: string, userId: string, accountId: string): Promise<symbols> {
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
  findByCode(code: string, userId: string, accountId: string): Promise<symbols | null> {
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
        throw new ConflictException(`Symbol with code ${data.code} already exists`);
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
  async remove(id: string, userId: string, accountId: string): Promise<symbols> {
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
}
