import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOperationDto } from './dto/create-operation.dto';
import { CreateEntryDto } from './dto/create-entry.dto';
import { CreatePriceHistoryDto } from './dto/create-price-history.dto';
import { PrismaService } from '../prisma/prisma.service';
import { operations } from '@prisma/client';

/**
 * Servicio para gestionar operaciones de trading
 * Incluye lógica de cierre automático y cálculos de P&L
 */
@Injectable()
export class OperationsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calcula si una operación debe cerrarse automáticamente
   * Cierre cuando: sum(buy.qty) == sum(sell.qty)
   */
  private async shouldCloseOperation(operationId: string, tx: any): Promise<boolean> {
    const entries = await tx.operation_entries.findMany({
      where: { operationId },
    });

    const buyQty = entries
      .filter(e => e.entryType === 'buy')
      .reduce((sum, e) => sum + Number(e.quantity), 0);

    const sellQty = entries
      .filter(e => e.entryType === 'sell')
      .reduce((sum, e) => sum + Number(e.quantity), 0);

    return buyQty === sellQty && buyQty > 0;
  }

  /**
   * Calcula el balance de una operación cerrada
   * Long: sellTotal - buyTotal - taxes
   * Short: buyTotal - sellTotal - taxes
   */
  private async calculateBalance(operationId: string, operationType: string, tx: any): Promise<number> {
    const entries = await tx.operation_entries.findMany({
      where: { operationId },
    });

    const buyTotal = entries
      .filter(e => e.entryType === 'buy')
      .reduce((sum, e) => sum + (Number(e.quantity) * Number(e.price)), 0);

    const sellTotal = entries
      .filter(e => e.entryType === 'sell')
      .reduce((sum, e) => sum + (Number(e.quantity) * Number(e.price)), 0);

    const totalTaxes = entries.reduce((sum, e) => sum + Number(e.tax), 0);

    if (operationType === 'long') {
      return sellTotal - buyTotal - totalTaxes;
    } else {
      return buyTotal - sellTotal - totalTaxes;
    }
  }

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
   * Calcula métricas de una operación abierta
   */
  private calculateMetrics(operation: any, currentPrice?: number) {
    const entries = operation.entries || [];

    const buyEntries = entries.filter((e: any) => e.entryType === 'buy');
    const sellEntries = entries.filter((e: any) => e.entryType === 'sell');

    const buyQty = buyEntries.reduce((sum: number, e: any) => sum + Number(e.quantity), 0);
    const sellQty = sellEntries.reduce((sum: number, e: any) => sum + Number(e.quantity), 0);
    const currentQty = buyQty - sellQty;

    const buyTotal = buyEntries.reduce((sum: number, e: any) => sum + (Number(e.quantity) * Number(e.price)), 0);
    const avgBuyPrice = buyQty > 0 ? buyTotal / buyQty : 0;

    let unrealizedPnL: number | null = null;
    if (currentPrice && currentQty > 0) {
      if (operation.type === 'long') {
        unrealizedPnL = (currentPrice - avgBuyPrice) * currentQty;
      } else {
        unrealizedPnL = (avgBuyPrice - currentPrice) * currentQty;
      }
    }

    return {
      currentQty,
      avgBuyPrice,
      unrealizedPnL,
      buyQty,
      sellQty,
    };
  }

  /**
   * Obtener detalle de operación con entries, prices y cálculos
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
          take: 1,
        },
      },
    });

    if (!operation) {
      throw new NotFoundException(`Operation with id ${id} not found`);
    }

    // Si está abierta, calcular métricas
    if (operation.status === 'open') {
      const currentPrice = operation.prices[0]?.price;
      const metrics = this.calculateMetrics(operation, currentPrice ? Number(currentPrice) : undefined);

      return {
        ...operation,
        metrics,
      };
    }

    return operation;
  }

  /**
   * Agregar entrada a una operación con cierre automático
   * Si sum(buy.qty) == sum(sell.qty), cierra la operación y calcula balance
   */
  async addEntry(operationId: string, data: CreateEntryDto): Promise<any> {
    const operation = await this.prisma.operations.findUnique({
      where: { id: operationId },
    });

    if (!operation) {
      throw new NotFoundException(`Operation with id ${operationId} not found`);
    }

    if (operation.status === 'closed') {
      throw new Error('Cannot add entry to a closed operation');
    }

    return this.prisma.$transaction(async (tx) => {
      // Crear la entrada
      const entry = await tx.operation_entries.create({
        data: {
          operationId,
          ...data,
          date: new Date(data.date),
        },
      });

      // Verificar si debe cerrarse automáticamente
      const shouldClose = await this.shouldCloseOperation(operationId, tx);

      if (shouldClose) {
        const balance = await this.calculateBalance(operationId, operation.type, tx);

        await tx.operations.update({
          where: { id: operationId },
          data: {
            status: 'closed',
            balance,
          },
        });
      }

      return entry;
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
