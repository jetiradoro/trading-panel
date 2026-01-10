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
  async create(data: CreateSymbolDto): Promise<symbols> {
    const existing = await this.prisma.symbols.findUnique({
      where: { code: data.code },
    });

    if (existing) {
      throw new ConflictException(`Symbol with code ${data.code} already exists`);
    }

    return this.prisma.symbols.create({ data });
  }

  /**
   * Listar todos los símbolos
   */
  findAll(): Promise<symbols[]> {
    return this.prisma.symbols.findMany({
      orderBy: { code: 'asc' },
    });
  }

  /**
   * Buscar símbolos por texto (código o nombre)
   */
  async search(query: string): Promise<symbols[]> {
    return this.prisma.symbols.findMany({
      where: {
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
  async findOne(id: string): Promise<symbols> {
    const symbol = await this.prisma.symbols.findUnique({
      where: { id },
    });

    if (!symbol) {
      throw new NotFoundException(`Symbol with id ${id} not found`);
    }

    return symbol;
  }

  /**
   * Buscar símbolo por código
   */
  findByCode(code: string): Promise<symbols | null> {
    return this.prisma.symbols.findUnique({
      where: { code },
    });
  }

  /**
   * Actualizar símbolo
   * @throws NotFoundException si no existe
   */
  async update(id: string, data: UpdateSymbolDto): Promise<symbols> {
    await this.findOne(id);

    if (data.code) {
      const existing = await this.prisma.symbols.findFirst({
        where: { code: data.code, id: { not: id } },
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
  async remove(id: string): Promise<symbols> {
    await this.findOne(id);
    return this.prisma.symbols.delete({ where: { id } });
  }

  /**
   * Agregar precio al historial del símbolo
   */
  async addPrice(symbolId: string, data: CreatePriceHistoryDto): Promise<any> {
    await this.findOne(symbolId);

    return this.prisma.price_history.create({
      data: {
        symbolId,
        price: data.price,
        date: new Date(data.date),
      },
    });
  }

  /**
   * Obtener historial de precios del símbolo
   */
  async getPrices(symbolId: string): Promise<any[]> {
    await this.findOne(symbolId);

    return this.prisma.price_history.findMany({
      where: { symbolId },
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
  ): Promise<any> {
    const price = await this.prisma.price_history.findUnique({
      where: { id: priceId },
    });

    if (!price || price.symbolId !== symbolId) {
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
  async removePrice(symbolId: string, priceId: string): Promise<any> {
    const price = await this.prisma.price_history.findUnique({
      where: { id: priceId },
    });

    if (!price || price.symbolId !== symbolId) {
      throw new NotFoundException(`Price with id ${priceId} not found`);
    }

    return this.prisma.price_history.delete({
      where: { id: priceId },
    });
  }
}
