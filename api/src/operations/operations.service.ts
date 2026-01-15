import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOperationDto } from './dto/create-operation.dto';
import { CreateEntryDto } from './dto/create-entry.dto';
import { UpdateEntryDto } from './dto/update-entry.dto';
import { PrismaService } from '../prisma/prisma.service';
import { operations } from '@prisma/client';

/**
 * Servicio para gestionar operaciones de trading
 * Incluye lógica de cierre automático y cálculos de P&L
 */
@Injectable()
export class OperationsService {
  constructor(private readonly prisma: PrismaService) {}

  private async findOperationForAccount(
    operationId: string,
    userId: string,
    accountId: string,
    client: PrismaService | any = this.prisma,
  ) {
    return client.operations.findFirst({
      where: { id: operationId, userId, accountId },
    });
  }

  /**
   * Calcula si una operación debe cerrarse automáticamente
   * Cierre cuando: sum(buy.qty) == sum(sell.qty)
   */
  private async shouldCloseOperation(
    operationId: string,
    tx: any,
  ): Promise<boolean> {
    const entries = await tx.operation_entries.findMany({
      where: { operationId },
    });

    const buyQty = entries
      .filter((e) => e.entryType === 'buy')
      .reduce((sum, e) => sum + Number(e.quantity), 0);

    const sellQty = entries
      .filter((e) => e.entryType === 'sell')
      .reduce((sum, e) => sum + Number(e.quantity), 0);

    return buyQty === sellQty && buyQty > 0;
  }

  /**
   * Suma total de comisiones/impuestos de las entradas
   */
  private calculateTotalFees(entries: any[]): number {
    return (entries || []).reduce(
      (sum: number, entry: any) => sum + Number(entry.tax || 0),
      0,
    );
  }

  /**
   * Calcula el balance de una operación cerrada
   * Long: sellTotal - buyTotal
   * Short: buyTotal - sellTotal
   */
  private async calculateBalance(
    operationId: string,
    operationType: string,
    tx: any,
  ): Promise<number> {
    const entries = await tx.operation_entries.findMany({
      where: { operationId },
    });

    const buyTotal = entries
      .filter((e) => e.entryType === 'buy')
      .reduce(
        (sum, e) => sum + Number(e.quantity) * Number(e.price) + Number(e.tax),
        0,
      );

    const sellTotal = entries
      .filter((e) => e.entryType === 'sell')
      .reduce(
        (sum, e) => sum + Number(e.quantity) * Number(e.price) - Number(e.tax),
        0,
      );

    if (operationType === 'long') {
      return sellTotal - buyTotal;
    } else {
      return buyTotal - sellTotal;
    }
  }

  /**
   * Actualizar estado de operación de forma manual
   * closed: calcula balance, open: limpia balance
   */
  async updateStatus(
    operationId: string,
    status: 'open' | 'closed',
    userId: string,
    accountId: string,
  ): Promise<any> {
    const operation = await this.findOperationForAccount(operationId, userId, accountId);

    if (!operation) {
      throw new NotFoundException(`Operation with id ${operationId} not found`);
    }

    if (status === 'open') {
      await this.prisma.operations.update({
        where: { id: operationId },
        data: { status: 'open', balance: null },
      });
      return this.findOne(operationId, userId, accountId);
    }

    await this.prisma.$transaction(async (tx) => {
      const balance = await this.calculateBalance(
        operationId,
        operation.type,
        tx,
      );
      await tx.operations.update({
        where: { id: operationId },
        data: { status: 'closed', balance },
      });
    });

    return this.findOne(operationId, userId, accountId);
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

    const account = await this.prisma.accounts.findFirst({
      where: { id: accountId, userId },
    });
    if (!account) {
      throw new NotFoundException('Active account not found');
    }

    const symbol = await this.prisma.symbols.findFirst({
      where: { id: symbolId, userId, accountId },
    });
    if (!symbol) {
      throw new NotFoundException('Symbol not found for active account');
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

        // Insertar automáticamente el precio de entrada en el historial del símbolo
        await tx.price_history.create({
          data: {
            symbolId: symbolId,
            userId,
            accountId,
            price: firstEntry.price,
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
    accountId: string;
    status?: string;
    product?: string;
    symbolId?: string;
  }): Promise<any[]> {
    const { userId, accountId, status, product, symbolId } = filters;

    const operations = await this.prisma.operations.findMany({
      where: {
        userId,
        accountId,
        ...(status && { status }),
        ...(product && { product }),
        ...(symbolId && { symbolId }),
      },
      include: {
        symbol: {
          include: {
            priceHistory: {
              where: { accountId },
              orderBy: { date: 'desc' },
            },
          },
        },
        account: true,
        entries: {
          orderBy: { date: 'asc' },
        },
      },
    });

    operations.sort((a: any, b: any) => {
      const aDate = a.entries?.[0]?.date ?? a.createdAt;
      const bDate = b.entries?.[0]?.date ?? b.createdAt;
      return bDate.getTime() - aDate.getTime();
    });

    // Calcular métricas para operaciones abiertas
    return operations.map((operation: any) => {
      const totalFees = this.calculateTotalFees(operation.entries);
      if (operation.status === 'open') {
        const currentPrice = operation.symbol?.priceHistory?.[0]?.price;
        const metrics = this.calculateMetrics(
          operation,
          currentPrice ? Number(currentPrice) : undefined,
        );
        return {
          ...operation,
          totalFees,
          metrics,
        };
      }
      return { ...operation, totalFees };
    });
  }

  /**
   * Calcula métricas de una operación abierta
   */
  private calculateMetrics(operation: any, currentPrice?: number) {
    const entries = operation.entries || [];

    const buyEntries = entries.filter((e: any) => e.entryType === 'buy');
    const sellEntries = entries.filter((e: any) => e.entryType === 'sell');

    const buyQty = buyEntries.reduce(
      (sum: number, e: any) => sum + Number(e.quantity),
      0,
    );
    const sellQty = sellEntries.reduce(
      (sum: number, e: any) => sum + Number(e.quantity),
      0,
    );
    const currentQty = buyQty - sellQty;

    const buyTotal = buyEntries.reduce(
      (sum: number, e: any) => sum + Number(e.quantity) * Number(e.price),
      0,
    );
    const avgBuyPrice = buyQty > 0 ? buyTotal / buyQty : 0;

    let unrealizedPnL: number | null = null;
    let pnlPercentage: number | null = null;
    let currentInvestment: number | null = null;

    if (currentPrice && currentQty > 0) {
      currentInvestment = avgBuyPrice * currentQty;

      if (operation.type === 'long') {
        unrealizedPnL = (currentPrice - avgBuyPrice) * currentQty;
      } else {
        unrealizedPnL = (avgBuyPrice - currentPrice) * currentQty;
      }

      // Calcular porcentaje de ganancia/pérdida
      if (currentInvestment > 0) {
        pnlPercentage = (unrealizedPnL / currentInvestment) * 100;
      }
    }

    return {
      currentQty,
      avgBuyPrice,
      unrealizedPnL,
      pnlPercentage,
      currentInvestment,
      buyQty,
      sellQty,
    };
  }

  /**
   * Obtener detalle de operación con entries y cálculos
   */
  async findOne(id: string, userId: string, accountId: string): Promise<any> {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const operation = await this.prisma.operations.findFirst({
      where: { id, userId, accountId },
      include: {
        symbol: {
          include: {
            priceHistory: {
              where: {
                accountId,
                date: { gte: oneYearAgo },
              },
              orderBy: { date: 'desc' },
            },
          },
        },
        account: true,
        entries: {
          orderBy: { date: 'asc' },
        },
      },
    });

    if (!operation) {
      throw new NotFoundException(`Operation with id ${id} not found`);
    }
    const totalFees = this.calculateTotalFees((operation as any).entries);

    // Si está abierta, calcular métricas
    if (operation.status === 'open') {
      const currentPrice = (operation as any).symbol?.priceHistory?.[0]?.price;
      const metrics = this.calculateMetrics(
        operation,
        currentPrice ? Number(currentPrice) : undefined,
      );

      return {
        ...operation,
        totalFees,
        metrics,
      };
    }

    return {
      ...operation,
      totalFees,
    };
  }

  /**
   * Agregar entrada a una operación con cierre automático
   * Si sum(buy.qty) == sum(sell.qty), cierra la operación y calcula balance
   */
  async addEntry(
    operationId: string,
    data: CreateEntryDto,
    userId: string,
    accountId: string,
  ): Promise<any> {
    const operation = await this.prisma.operations.findFirst({
      where: { id: operationId, userId, accountId },
      select: {
        id: true,
        status: true,
        type: true,
        symbolId: true,
        userId: true,
        accountId: true,
      },
    });

    if (!operation) {
      throw new NotFoundException(`Operation with id ${operationId} not found`);
    }

    if (operation.status === 'closed') {
      throw new Error('Cannot add entry to a closed operation');
    }

    return this.prisma.$transaction(async (tx) => {
      const entryDate = new Date(data.date);

      // Crear la entrada
      const entry = await tx.operation_entries.create({
        data: {
          operationId,
          ...data,
          date: entryDate,
        },
      });

      if (operation.symbolId) {
        await tx.price_history.create({
          data: {
            symbolId: operation.symbolId,
            userId: operation.userId,
            accountId: operation.accountId,
            price: data.price,
            date: entryDate,
          },
        });
      }

      // Verificar si debe cerrarse automáticamente
      const shouldClose = await this.shouldCloseOperation(operationId, tx);

      if (shouldClose) {
        const balance = await this.calculateBalance(
          operationId,
          operation.type,
          tx,
        );

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
   * Actualizar entrada de operación
   */
  async updateEntry(
    operationId: string,
    entryId: string,
    data: UpdateEntryDto,
    userId: string,
    accountId: string,
  ): Promise<any> {
    const operation = await this.findOperationForAccount(operationId, userId, accountId);
    if (!operation) {
      throw new NotFoundException(`Operation with id ${operationId} not found`);
    }
    const entry = await this.prisma.operation_entries.findUnique({
      where: { id: entryId },
    });

    if (!entry || entry.operationId !== operationId) {
      throw new NotFoundException(`Entry with id ${entryId} not found`);
    }

    const updateData: any = { ...data };
    if (data.date) {
      updateData.date = new Date(data.date);
    }

    return this.prisma.operation_entries.update({
      where: { id: entryId },
      data: updateData,
    });
  }

  /**
   * Eliminar entrada de operación
   */
  async removeEntry(
    operationId: string,
    entryId: string,
    userId: string,
    accountId: string,
  ): Promise<any> {
    return this.prisma.$transaction(async (tx) => {
      const entry = await tx.operation_entries.findUnique({
        where: { id: entryId },
      });

      if (!entry || entry.operationId !== operationId) {
        throw new NotFoundException(`Entry with id ${entryId} not found`);
      }

      const operation = await this.findOperationForAccount(
        operationId,
        userId,
        accountId,
        tx,
      );

      if (!operation) {
        throw new NotFoundException(
          `Operation with id ${operationId} not found`,
        );
      }

      const deletedEntry = await tx.operation_entries.delete({
        where: { id: entryId },
      });

      if (operation.status === 'closed') {
        await tx.operations.update({
          where: { id: operationId },
          data: { status: 'open', balance: null },
        });
      }

      return deletedEntry;
    });
  }

  /**
   * Eliminar operación
   */
  async remove(id: string, userId: string, accountId: string): Promise<operations> {
    const operation = await this.prisma.operations.findFirst({
      where: { id, userId, accountId },
    });

    if (!operation) {
      throw new NotFoundException(`Operation with id ${id} not found`);
    }

    return this.prisma.operations.delete({
      where: { id },
    });
  }
}
