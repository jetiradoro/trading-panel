import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOperationDto } from './dto/create-operation.dto';
import { CreateEntryDto } from './dto/create-entry.dto';
import { CreatePriceHistoryDto } from './dto/create-price-history.dto';
import { PrismaService } from '../prisma/prisma.service';
import { operations } from '@prisma/client';

/**
 * Servicio para gestionar operaciones de trading
 * Fase 1: CRUD básico sin lógica de cierre automático
 */
@Injectable()
export class OperationsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crear operación con entrada inicial opcional
   */
  async create(data: CreateOperationDto): Promise<operations> {
    const { firstEntry, userId, accountId, symbolId, product, type } = data;

    // Asegurar que userId existe
    if (!userId) {
      throw new Error('userId is required');
    }

    // Transacción para crear operación y primera entrada
    return this.prisma.$transaction(async (tx) => {
      const operation = await tx.operations.create({
        data: {
          accountId,
          userId,
          symbolId,
          product,
          type,
        },
      });

      if (firstEntry) {
        await tx.operation_entries.create({
          data: {
            operationId: operation.id,
            ...firstEntry,
            date: new Date(firstEntry.date),
          },
        });
      }

      return operation;
    });
  }

  /**
   * Listar operaciones con filtros opcionales
   */
  async findAll(filters: {
    userId: string;
    status?: string;
    product?: string;
    symbolId?: string;
  }): Promise<operations[]> {
    const { userId, status, product, symbolId } = filters;

    return this.prisma.operations.findMany({
      where: {
        userId,
        ...(status && { status }),
        ...(product && { product }),
        ...(symbolId && { symbolId }),
      },
      include: {
        symbol: true,
        account: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Obtener detalle de operación con entries y prices
   */
  async findOne(id: string): Promise<any> {
    const operation = await this.prisma.operations.findUnique({
      where: { id },
      include: {
        symbol: true,
        account: true,
        entries: {
          orderBy: { date: 'asc' },
        },
        prices: {
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!operation) {
      throw new NotFoundException(`Operation with id ${id} not found`);
    }

    return operation;
  }

  /**
   * Agregar entrada a una operación
   * Fase 1: Sin lógica de cierre automático
   */
  async addEntry(operationId: string, data: CreateEntryDto): Promise<any> {
    const operation = await this.prisma.operations.findUnique({
      where: { id: operationId },
    });

    if (!operation) {
      throw new NotFoundException(`Operation with id ${operationId} not found`);
    }

    return this.prisma.operation_entries.create({
      data: {
        operationId,
        ...data,
        date: new Date(data.date),
      },
    });
  }

  /**
   * Eliminar entrada de operación
   */
  async removeEntry(operationId: string, entryId: string): Promise<any> {
    const entry = await this.prisma.operation_entries.findUnique({
      where: { id: entryId },
    });

    if (!entry || entry.operationId !== operationId) {
      throw new NotFoundException(`Entry with id ${entryId} not found`);
    }

    return this.prisma.operation_entries.delete({
      where: { id: entryId },
    });
  }

  /**
   * Agregar precio histórico
   */
  async addPrice(
    operationId: string,
    data: CreatePriceHistoryDto,
  ): Promise<any> {
    const operation = await this.prisma.operations.findUnique({
      where: { id: operationId },
    });

    if (!operation) {
      throw new NotFoundException(`Operation with id ${operationId} not found`);
    }

    return this.prisma.price_history.create({
      data: {
        operationId,
        ...data,
        date: new Date(data.date),
      },
    });
  }

  /**
   * Eliminar operación
   */
  async remove(id: string): Promise<operations> {
    const operation = await this.prisma.operations.findUnique({
      where: { id },
    });

    if (!operation) {
      throw new NotFoundException(`Operation with id ${id} not found`);
    }

    return this.prisma.operations.delete({
      where: { id },
    });
  }
}
