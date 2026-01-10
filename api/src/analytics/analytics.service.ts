import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  AccountBalanceDto,
  PerformanceDto,
  SymbolPerformanceDto,
  ProductDistributionDto,
  PortfolioPointDto,
  DashboardResponseDto,
} from './dto/dashboard.dto';

/**
 * Servicio de analítica para calcular métricas de inversiones
 * Todos los cálculos se hacen en tiempo real sobre las tablas existentes
 */
@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Convierte periodo a fecha de inicio
   */
  private getDateFromPeriod(period: string): Date | null {
    const now = new Date();
    switch (period) {
      case '7d':
        return new Date(now.setDate(now.getDate() - 7));
      case '30d':
        return new Date(now.setDate(now.getDate() - 30));
      case '90d':
        return new Date(now.setDate(now.getDate() - 90));
      case '1y':
        return new Date(now.setFullYear(now.getFullYear() - 1));
      case 'all':
      default:
        return null;
    }
  }

  /**
   * Obtiene el balance de cuenta: total, invertido y disponible
   */
  async getAccountBalance(
    userId: string,
    accountId?: string,
  ): Promise<AccountBalanceDto> {
    const whereAccount = accountId ? { id: accountId, userId } : { userId };

    // Total de transacciones (depósitos - retiros)
    const transactions = await this.prisma.transactions.aggregate({
      where: { userId, ...(accountId && { accountId }) },
      _sum: { amount: true },
    });
    const totalFromTransactions = transactions._sum.amount || 0;

    // Calcular dinero invertido en operaciones abiertas
    const openOperations = await this.prisma.operations.findMany({
      where: {
        userId,
        status: 'open',
        ...(accountId && { accountId }),
      },
      include: { entries: true },
    });

    let totalInvested = 0;
    for (const op of openOperations) {
      const buyTotal = op.entries
        .filter((e) => e.entryType === 'buy')
        .reduce((sum, e) => sum + Number(e.quantity) * Number(e.price), 0);
      const sellTotal = op.entries
        .filter((e) => e.entryType === 'sell')
        .reduce((sum, e) => sum + Number(e.quantity) * Number(e.price), 0);
      totalInvested += buyTotal - sellTotal;
    }

    const availableCash = totalFromTransactions - totalInvested;

    return {
      totalFromTransactions,
      totalInvested,
      availableCash,
    };
  }

  /**
   * Obtiene métricas de rendimiento global
   */
  async getPerformance(
    userId: string,
    period: string,
    accountId?: string,
  ): Promise<PerformanceDto> {
    const dateFrom = this.getDateFromPeriod(period);

    // Operaciones cerradas (P&L realizado)
    const closedOperations = await this.prisma.operations.findMany({
      where: {
        userId,
        status: 'closed',
        ...(accountId && { accountId }),
        ...(dateFrom && { updatedAt: { gte: dateFrom } }),
      },
    });

    const realizedPnL = closedOperations.reduce(
      (sum, op) => sum + (op.balance || 0),
      0,
    );
    const winningOperations = closedOperations.filter(
      (op) => (op.balance || 0) > 0,
    ).length;
    const losingOperations = closedOperations.filter(
      (op) => (op.balance || 0) < 0,
    ).length;
    const totalClosedOps = closedOperations.length;
    const winRate =
      totalClosedOps > 0 ? (winningOperations / totalClosedOps) * 100 : 0;

    // Operaciones abiertas (P&L no realizado)
    const openOperations = await this.prisma.operations.findMany({
      where: {
        userId,
        status: 'open',
        ...(accountId && { accountId }),
      },
      include: {
        entries: true,
        symbol: {
          include: {
            priceHistory: { orderBy: { date: 'desc' }, take: 1 },
          },
        },
      },
    });

    let unrealizedPnL = 0;
    let totalCurrentInvestment = 0;

    for (const op of openOperations) {
      const currentPrice = op.symbol?.priceHistory?.[0]?.price;
      if (!currentPrice) continue;

      const buyEntries = op.entries.filter((e) => e.entryType === 'buy');
      const sellEntries = op.entries.filter((e) => e.entryType === 'sell');

      const buyQty = buyEntries.reduce((sum, e) => sum + Number(e.quantity), 0);
      const sellQty = sellEntries.reduce(
        (sum, e) => sum + Number(e.quantity),
        0,
      );
      const currentQty = buyQty - sellQty;

      if (currentQty <= 0) continue;

      const buyTotal = buyEntries.reduce(
        (sum, e) => sum + Number(e.quantity) * Number(e.price),
        0,
      );
      const avgBuyPrice = buyQty > 0 ? buyTotal / buyQty : 0;
      const currentInvestment = avgBuyPrice * currentQty;
      totalCurrentInvestment += currentInvestment;

      if (op.type === 'long') {
        unrealizedPnL += (Number(currentPrice) - avgBuyPrice) * currentQty;
      } else {
        unrealizedPnL += (avgBuyPrice - Number(currentPrice)) * currentQty;
      }
    }

    const totalPnL = realizedPnL + unrealizedPnL;
    const totalPnLPercentage =
      totalCurrentInvestment > 0
        ? (totalPnL / totalCurrentInvestment) * 100
        : 0;

    return {
      realizedPnL,
      unrealizedPnL,
      totalPnL,
      totalPnLPercentage,
      winningOperations,
      losingOperations,
      winRate,
    };
  }

  /**
   * Obtiene ranking de símbolos por rendimiento
   */
  async getSymbolsRanking(
    userId: string,
    period: string,
    accountId?: string,
  ): Promise<SymbolPerformanceDto[]> {
    const dateFrom = this.getDateFromPeriod(period);

    const operations = await this.prisma.operations.findMany({
      where: {
        userId,
        ...(accountId && { accountId }),
      },
      include: {
        symbol: {
          include: {
            priceHistory: { orderBy: { date: 'desc' }, take: 30 },
          },
        },
        entries: {
          ...(dateFrom && {
            where: { date: { gte: dateFrom } },
          }),
        },
      },
    });

    // Agrupar por símbolo
    const symbolsMap = new Map<string, SymbolPerformanceDto>();

    for (const op of operations) {
      if (!op.symbol) continue;

      const symbolId = op.symbolId;
      let data = symbolsMap.get(symbolId);

      if (!data) {
        data = {
          symbolId,
          code: op.symbol.code,
          name: op.symbol.name,
          logo: op.symbol.logo,
          product: op.symbol.product,
          totalInvested: 0,
          realizedPnL: 0,
          unrealizedPnL: 0,
          totalPnL: 0,
          pnlPercentage: 0,
          operationsCount: 0,
          sparklineData: op.symbol.priceHistory
            .map((p) => Number(p.price))
            .reverse(),
        };
        symbolsMap.set(symbolId, data);
      }

      data.operationsCount++;

      if (op.status === 'closed') {
        data.realizedPnL += op.balance || 0;
      } else {
        // Calcular P&L no realizado
        const currentPrice = op.symbol.priceHistory[0]?.price;
        if (currentPrice) {
          const buyEntries = op.entries.filter((e) => e.entryType === 'buy');
          const sellEntries = op.entries.filter((e) => e.entryType === 'sell');

          const buyQty = buyEntries.reduce(
            (sum, e) => sum + Number(e.quantity),
            0,
          );
          const sellQty = sellEntries.reduce(
            (sum, e) => sum + Number(e.quantity),
            0,
          );
          const currentQty = buyQty - sellQty;

          if (currentQty > 0) {
            const buyTotal = buyEntries.reduce(
              (sum, e) => sum + Number(e.quantity) * Number(e.price),
              0,
            );
            const avgBuyPrice = buyQty > 0 ? buyTotal / buyQty : 0;
            data.totalInvested += avgBuyPrice * currentQty;

            if (op.type === 'long') {
              data.unrealizedPnL +=
                (Number(currentPrice) - avgBuyPrice) * currentQty;
            } else {
              data.unrealizedPnL +=
                (avgBuyPrice - Number(currentPrice)) * currentQty;
            }
          }
        }
      }
    }

    // Calcular totales y ordenar
    const result = Array.from(symbolsMap.values()).map((s) => {
      s.totalPnL = s.realizedPnL + s.unrealizedPnL;
      s.pnlPercentage =
        s.totalInvested > 0 ? (s.totalPnL / s.totalInvested) * 100 : 0;
      return s;
    });

    return result.sort((a, b) => b.totalPnL - a.totalPnL);
  }

  /**
   * Obtiene distribución de inversiones por tipo de producto
   */
  async getProductDistribution(
    userId: string,
    accountId?: string,
  ): Promise<ProductDistributionDto[]> {
    const operations = await this.prisma.operations.findMany({
      where: {
        userId,
        status: 'open',
        ...(accountId && { accountId }),
      },
      include: { entries: true },
    });

    const productLabels: Record<string, string> = {
      crypto: 'Criptos',
      stock: 'Acciones',
      etf: 'ETFs',
    };

    const productsMap = new Map<string, ProductDistributionDto>();

    for (const op of operations) {
      let data = productsMap.get(op.product);

      if (!data) {
        data = {
          product: op.product,
          label: productLabels[op.product] || op.product,
          totalInvested: 0,
          percentage: 0,
          operationsCount: 0,
          pnl: 0,
        };
        productsMap.set(op.product, data);
      }

      const buyTotal = op.entries
        .filter((e) => e.entryType === 'buy')
        .reduce((sum, e) => sum + Number(e.quantity) * Number(e.price), 0);
      const sellTotal = op.entries
        .filter((e) => e.entryType === 'sell')
        .reduce((sum, e) => sum + Number(e.quantity) * Number(e.price), 0);

      data.totalInvested += buyTotal - sellTotal;
      data.operationsCount++;
    }

    // Calcular porcentajes
    const total = Array.from(productsMap.values()).reduce(
      (sum, p) => sum + p.totalInvested,
      0,
    );
    const result = Array.from(productsMap.values()).map((p) => {
      p.percentage = total > 0 ? (p.totalInvested / total) * 100 : 0;
      return p;
    });

    return result.sort((a, b) => b.totalInvested - a.totalInvested);
  }

  /**
   * Obtiene evolución del portfolio para gráfico temporal
   */
  async getPortfolioEvolution(
    userId: string,
    period: string,
    accountId?: string,
  ): Promise<PortfolioPointDto[]> {
    const dateFrom = this.getDateFromPeriod(period);
    const startDate =
      dateFrom ||
      new Date(new Date().setFullYear(new Date().getFullYear() - 1));

    // Obtener todas las entradas en el periodo
    const entries = await this.prisma.operation_entries.findMany({
      where: {
        operation: {
          userId,
          ...(accountId && { accountId }),
        },
        date: { gte: startDate },
      },
      include: {
        operation: {
          include: { symbol: true },
        },
      },
      orderBy: { date: 'asc' },
    });

    // Generar puntos por día/semana según periodo
    const interval =
      period === '7d' ? 1 : period === '30d' ? 1 : period === '90d' ? 7 : 30;
    const points: PortfolioPointDto[] = [];
    const now = new Date();

    let currentDate = new Date(startDate);
    let runningInvested = 0;

    while (currentDate <= now) {
      const dateStr = currentDate.toISOString().split('T')[0];

      // Sumar entradas hasta esta fecha
      for (const entry of entries) {
        if (new Date(entry.date) <= currentDate && !entry['counted']) {
          if (entry.entryType === 'buy') {
            runningInvested += Number(entry.quantity) * Number(entry.price);
          } else {
            runningInvested -= Number(entry.quantity) * Number(entry.price);
          }
          entry['counted'] = true;
        }
      }

      points.push({
        date: dateStr,
        totalInvested: runningInvested,
        portfolioValue: runningInvested, // Simplificado, sin valoración de mercado
        pnl: 0,
      });

      currentDate.setDate(currentDate.getDate() + interval);
    }

    return points;
  }

  /**
   * Obtiene todos los datos del dashboard en una sola llamada
   */
  async getDashboard(
    userId: string,
    period: string = '30d',
    accountId?: string,
  ): Promise<DashboardResponseDto> {
    const [
      accountBalance,
      performance,
      symbolsRanking,
      productDistribution,
      portfolioEvolution,
    ] = await Promise.all([
      this.getAccountBalance(userId, accountId),
      this.getPerformance(userId, period, accountId),
      this.getSymbolsRanking(userId, period, accountId),
      this.getProductDistribution(userId, accountId),
      this.getPortfolioEvolution(userId, period, accountId),
    ]);

    return {
      accountBalance,
      performance,
      symbolsRanking,
      productDistribution,
      portfolioEvolution,
      lastUpdated: new Date().toISOString(),
    };
  }
}
