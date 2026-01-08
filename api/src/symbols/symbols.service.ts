import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateSymbolDto } from './dto/create-symbol.dto';
import { UpdateSymbolDto } from './dto/update-symbol.dto';
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
}
