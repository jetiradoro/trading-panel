import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  AccountBalanceDto,
  PerformanceDto,
  SymbolPerformanceDto,
  ProductDistributionDto,
  PortfolioPointDto,
  MonthlyPerformanceDto,
  EquityPointDto,
  RiskMetricsDto,
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
      case '1m':
        return new Date(now.setMonth(now.getMonth() - 1));
      case '3m':
        return new Date(now.setMonth(now.getMonth() - 3));
      case '6m':
        return new Date(now.setMonth(now.getMonth() - 6));
      case '30d':
        return new Date(now.setDate(now.getDate() - 30));
      case '90d':
        return new Date(now.setDate(now.getDate() - 90));
      case '1y':
        return new Date(now.setFullYear(now.getFullYear() - 1));
      case '5y':
        return new Date(now.setFullYear(now.getFullYear() - 5));
      case 'all':
      default:
        return null;
    }
  }

  /**
   * Fecha de cierre basada en la ultima entrada registrada
   */
  private getOperationCloseDate(
    entries?: { date: Date }[],
    fallback?: Date,
  ): Date | null {
    const entryDate =
      entries && entries.length > 0 ? new Date(entries[0].date) : null;
    return entryDate || fallback || null;
  }

  /**
   * Filtro de producto para separar Trading vs ETFs
   */
  private getProductFilter(product?: 'trading' | 'etf') {
    if (!product) return undefined;
    return product === 'etf' ? { product: 'etf' } : { product: { not: 'etf' } };
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
      include: {
        entries: true,
        symbol: {
          include: {
            priceHistory: { orderBy: { date: 'desc' }, take: 1 },
          },
        },
      },
    });

    let totalInvested = 0;
    let investedTrading = 0;
    let investedEtf = 0;
    let openPnLTrading = 0;
    let openPnLEtf = 0;

    for (const op of openOperations) {
      const buyTotal = op.entries
        .filter((e) => e.entryType === 'buy')
        .reduce((sum, e) => sum + Number(e.quantity) * Number(e.price), 0);
      const sellTotal = op.entries
        .filter((e) => e.entryType === 'sell')
        .reduce((sum, e) => sum + Number(e.quantity) * Number(e.price), 0);
      const invested = buyTotal - sellTotal;
      totalInvested += invested;

      if (op.product === 'etf') {
        investedEtf += invested;
      } else {
        investedTrading += invested;
      }

      const currentPrice = op.symbol?.priceHistory?.[0]?.price;
      if (!currentPrice) continue;

      const buyQty = op.entries
        .filter((e) => e.entryType === 'buy')
        .reduce((sum, e) => sum + Number(e.quantity), 0);
      const sellQty = op.entries
        .filter((e) => e.entryType === 'sell')
        .reduce((sum, e) => sum + Number(e.quantity), 0);
      const currentQty = buyQty - sellQty;

      if (currentQty <= 0) continue;

      const buyTotalForPnL = op.entries
        .filter((e) => e.entryType === 'buy')
        .reduce((sum, e) => sum + Number(e.quantity) * Number(e.price), 0);
      const avgBuyPrice = buyQty > 0 ? buyTotalForPnL / buyQty : 0;

      let pnl = 0;
      if (op.type === 'long') {
        pnl = (Number(currentPrice) - avgBuyPrice) * currentQty;
      } else {
        pnl = (avgBuyPrice - Number(currentPrice)) * currentQty;
      }

      if (op.product === 'etf') {
        openPnLEtf += pnl;
      } else {
        openPnLTrading += pnl;
      }
    }

    const availableCash = totalFromTransactions - totalInvested;
    const totalOpenPnL = openPnLTrading + openPnLEtf;
    const totalOpenValue = totalInvested + totalOpenPnL;

    return {
      totalFromTransactions,
      totalInvested,
      availableCash,
      investedTrading,
      investedEtf,
      openPnLTrading,
      openPnLEtf,
      totalOpenPnL,
      totalOpenValue,
    };
  }

  /**
   * Obtiene métricas de rendimiento global
   */
  async getPerformance(
    userId: string,
    period: string,
    accountId?: string,
    product?: 'trading' | 'etf',
  ): Promise<PerformanceDto> {
    const dateFrom = this.getDateFromPeriod(period);
    const productFilter = this.getProductFilter(product);

    // Operaciones cerradas (P&L realizado)
    const closedOperations = await this.prisma.operations.findMany({
      where: {
        userId,
        status: 'closed',
        ...(accountId && { accountId }),
        ...(productFilter || {}),
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
        ...(productFilter || {}),
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
    product?: 'trading' | 'etf',
  ): Promise<SymbolPerformanceDto[]> {
    const dateFrom = this.getDateFromPeriod(period);
    const productFilter = this.getProductFilter(product);

    const operations = await this.prisma.operations.findMany({
      where: {
        userId,
        ...(accountId && { accountId }),
        ...(productFilter || {}),
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

      const buyTotalAll = op.entries
        .filter((e) => e.entryType === 'buy')
        .reduce((sum, e) => sum + Number(e.quantity) * Number(e.price), 0);
      data.totalInvested += buyTotalAll;

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
    product?: 'trading' | 'etf',
  ): Promise<PortfolioPointDto[]> {
    const dateFrom = this.getDateFromPeriod(period);
    const startDate =
      dateFrom ||
      new Date(new Date().setFullYear(new Date().getFullYear() - 1));
    const productFilter = this.getProductFilter(product);

    // Obtener todas las operaciones con sus entradas y precios históricos
    const operations = await this.prisma.operations.findMany({
      where: {
        userId,
        ...(accountId && { accountId }),
        ...(productFilter || {}),
      },
      include: {
        entries: {
          where: { date: { gte: startDate } },
          orderBy: { date: 'asc' },
        },
        symbol: {
          include: {
            priceHistory: {
              where: { date: { gte: startDate } },
              orderBy: { date: 'asc' },
            },
          },
        },
      },
    });

    // Generar puntos por día/semana según periodo
    const interval =
      period === '7d' ? 1 : period === '30d' ? 1 : period === '90d' ? 7 : 30;
    const points: PortfolioPointDto[] = [];
    const now = new Date();

    let currentDate = new Date(startDate);

    while (currentDate <= now) {
      const dateStr = currentDate.toISOString().split('T')[0];
      let totalInvested = 0;
      let portfolioValue = 0;

      // Para cada operación, calcular inversión y valor a esta fecha
      for (const op of operations) {
        // Obtener entradas hasta esta fecha
        const relevantEntries = op.entries.filter(
          (e) => new Date(e.date) <= currentDate,
        );

        if (relevantEntries.length === 0) continue;

        // Calcular cantidades y costes
        const buyEntries = relevantEntries.filter((e) => e.entryType === 'buy');
        const sellEntries = relevantEntries.filter(
          (e) => e.entryType === 'sell',
        );

        const buyQty = buyEntries.reduce(
          (sum, e) => sum + Number(e.quantity),
          0,
        );
        const sellQty = sellEntries.reduce(
          (sum, e) => sum + Number(e.quantity),
          0,
        );
        const currentQty = buyQty - sellQty;

        if (currentQty <= 0) continue;

        // Calcular inversión (coste de compra - ingresos por venta)
        const buyTotal = buyEntries.reduce(
          (sum, e) => sum + Number(e.quantity) * Number(e.price),
          0,
        );
        const sellTotal = sellEntries.reduce(
          (sum, e) => sum + Number(e.quantity) * Number(e.price),
          0,
        );
        totalInvested += buyTotal - sellTotal;

        // Obtener precio de mercado más cercano a esta fecha
        const priceAtDate = op.symbol?.priceHistory
          .filter((p) => new Date(p.date) <= currentDate)
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          )[0];

        if (priceAtDate) {
          portfolioValue += currentQty * Number(priceAtDate.price);
        } else {
          // Si no hay precio histórico, usar precio de compra promedio
          const avgBuyPrice = buyQty > 0 ? buyTotal / buyQty : 0;
          portfolioValue += currentQty * avgBuyPrice;
        }
      }

      const pnl = portfolioValue - totalInvested;

      points.push({
        date: dateStr,
        totalInvested,
        portfolioValue,
        pnl,
      });

      currentDate.setDate(currentDate.getDate() + interval);
    }

    return points;
  }

  /**
   * Análisis mensual de rendimiento
   */
  async getMonthlyPerformance(
    userId: string,
    accountId?: string,
    product?: 'trading' | 'etf',
  ): Promise<MonthlyPerformanceDto[]> {
    const productFilter = this.getProductFilter(product);
    const monthNames = [
      'Ene',
      'Feb',
      'Mar',
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Sep',
      'Oct',
      'Nov',
      'Dic',
    ];
    const operations = await this.prisma.operations.findMany({
      where: {
        userId,
        status: 'closed',
        ...(accountId && { accountId }),
        ...(productFilter || {}),
      },
      include: {
        entries: {
          orderBy: { date: 'desc' },
          take: 1,
        },
      },
    });

    const closedOpsWithDate = operations
      .map((op) => ({
        ...op,
        closeDate: this.getOperationCloseDate(op.entries, op.updatedAt),
      }))
      .filter((op) => op.closeDate);

    const monthsMap = new Map<string, MonthlyPerformanceDto>();

    for (const op of closedOpsWithDate) {
      const date = op.closeDate as Date;
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      let data = monthsMap.get(monthKey);
      if (!data) {
        data = {
          month: monthNames[date.getMonth()],
          year: date.getFullYear(),
          pnl: 0,
          pnlPercentage: 0,
          operationsClosed: 0,
          winRate: 0,
        };
        monthsMap.set(monthKey, data);
      }

      data.pnl += op.balance || 0;
      data.operationsClosed++;
    }

    const resultEntries = Array.from(monthsMap.entries()).sort(([a], [b]) =>
      a.localeCompare(b),
    );

    for (const [, month] of resultEntries) {
      const monthIndex = [
        'Ene',
        'Feb',
        'Mar',
        'Abr',
        'May',
        'Jun',
        'Jul',
        'Ago',
        'Sep',
        'Oct',
        'Nov',
        'Dic',
      ].indexOf(month.month);
      const monthOps = closedOpsWithDate.filter((op) => {
        const date = op.closeDate as Date;
        return (
          date.getFullYear() === month.year && date.getMonth() === monthIndex
        );
      });
      const wins = monthOps.filter((op) => (op.balance || 0) > 0).length;
      month.winRate = monthOps.length > 0 ? (wins / monthOps.length) * 100 : 0;
    }

    return resultEntries.map(([, month]) => month);
  }

  /**
   * Curva de equity (evolución del capital)
   */
  async getEquityCurve(
    userId: string,
    period: string,
    accountId?: string,
    product?: 'trading' | 'etf',
  ): Promise<EquityPointDto[]> {
    const dateFrom = this.getDateFromPeriod(period);
    const startDate =
      dateFrom ||
      new Date(new Date().setFullYear(new Date().getFullYear() - 1));
    const productFilter = this.getProductFilter(product);

    const transactions = await this.prisma.transactions.findMany({
      where: {
        userId,
        ...(accountId && { accountId }),
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
    });

    const closedOps = await this.prisma.operations.findMany({
      where: {
        userId,
        status: 'closed',
        ...(accountId && { accountId }),
        ...(productFilter || {}),
      },
      include: {
        entries: {
          orderBy: { date: 'desc' },
          take: 1,
        },
      },
    });

    const closedOpsWithDate = closedOps
      .map((op) => ({
        ...op,
        closeDate: this.getOperationCloseDate(op.entries, op.updatedAt),
      }))
      .filter((op) => op.closeDate && (op.closeDate as Date) >= startDate);

    const interval =
      period === '7d' ? 1 : period === '30d' ? 1 : period === '90d' ? 7 : 30;
    const points: EquityPointDto[] = [];
    const now = new Date();
    let currentDate = new Date(startDate);

    while (currentDate <= now) {
      const dateStr = currentDate.toISOString().split('T')[0];

      const transactionsUntilNow = transactions
        .filter((t) => new Date(t.date) <= currentDate)
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const depositsUntilNow = transactions
        .filter((t) => Number(t.amount) > 0 && new Date(t.date) <= currentDate)
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const withdrawalsUntilNow = Math.abs(
        transactions
          .filter(
            (t) => Number(t.amount) < 0 && new Date(t.date) <= currentDate,
          )
          .reduce((sum, t) => sum + Number(t.amount), 0),
      );

      const pnlUntilNow = closedOpsWithDate
        .filter((op) => (op.closeDate as Date) <= currentDate)
        .reduce((sum, op) => sum + (op.balance || 0), 0);

      const equity = transactionsUntilNow + pnlUntilNow;

      points.push({
        date: dateStr,
        equity,
        deposits: depositsUntilNow,
        withdrawals: withdrawalsUntilNow,
        pnl: pnlUntilNow,
      });

      currentDate.setDate(currentDate.getDate() + interval);
    }

    return points;
  }

  /**
   * Métricas de riesgo avanzadas
   */
  async getRiskMetrics(
    userId: string,
    period: string,
    accountId?: string,
    product?: 'trading' | 'etf',
  ): Promise<RiskMetricsDto> {
    const dateFrom = this.getDateFromPeriod(period);
    const productFilter = this.getProductFilter(product);

    const closedOps = await this.prisma.operations.findMany({
      where: {
        userId,
        status: 'closed',
        ...(accountId && { accountId }),
        ...(productFilter || {}),
      },
      include: {
        entries: {
          orderBy: { date: 'desc' },
          take: 1,
        },
      },
    });

    const filteredClosedOps = dateFrom
      ? closedOps.filter((op) => {
          const closeDate = this.getOperationCloseDate(
            op.entries,
            op.updatedAt,
          );
          return closeDate ? closeDate >= dateFrom : false;
        })
      : closedOps.map((op) => ({
          ...op,
          entries: op.entries,
        }));

    if (filteredClosedOps.length === 0) {
      return {
        sharpeRatio: 0,
        maxDrawdown: 0,
        maxDrawdownPercentage: 0,
        profitFactor: 0,
        avgWin: 0,
        avgLoss: 0,
        largestWin: 0,
        largestLoss: 0,
      };
    }

    const wins = filteredClosedOps.filter((op) => (op.balance || 0) > 0);
    const losses = filteredClosedOps.filter((op) => (op.balance || 0) < 0);

    const totalWins = wins.reduce((sum, op) => sum + (op.balance || 0), 0);
    const totalLosses = Math.abs(
      losses.reduce((sum, op) => sum + (op.balance || 0), 0),
    );

    const avgWin = wins.length > 0 ? totalWins / wins.length : 0;
    const avgLoss = losses.length > 0 ? totalLosses / losses.length : 0;

    const largestWin =
      wins.length > 0 ? Math.max(...wins.map((op) => op.balance || 0)) : 0;
    const largestLoss =
      losses.length > 0
        ? Math.abs(Math.min(...losses.map((op) => op.balance || 0)))
        : 0;

    const profitFactor =
      totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? 999 : 0;

    const returns = filteredClosedOps.map((op) => op.balance || 0);
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance =
      returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) /
      returns.length;
    const stdDev = Math.sqrt(variance);
    const sharpeRatio = stdDev > 0 ? avgReturn / stdDev : 0;

    let equity = 0;
    let peak = 0;
    let maxDrawdown = 0;
    let maxDrawdownPercentage = 0;

    const sortedOps = filteredClosedOps
      .map((op) => ({
        ...op,
        closeDate: this.getOperationCloseDate(op.entries, op.updatedAt),
      }))
      .sort(
        (a, b) =>
          (a.closeDate as Date).getTime() - (b.closeDate as Date).getTime(),
      );

    for (const op of sortedOps) {
      equity += op.balance || 0;
      if (equity > peak) peak = equity;
      const drawdown = peak - equity;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
        maxDrawdownPercentage = peak > 0 ? (drawdown / peak) * 100 : 0;
      }
    }

    return {
      sharpeRatio,
      maxDrawdown,
      maxDrawdownPercentage,
      profitFactor,
      avgWin,
      avgLoss,
      largestWin,
      largestLoss,
    };
  }

  /**
   * Obtiene todos los datos del dashboard en una sola llamada
   */
  async getDashboard(
    userId: string,
    period: string = '30d',
    accountId?: string,
    product?: 'trading' | 'etf',
  ): Promise<DashboardResponseDto> {
    const [
      accountBalance,
      performance,
      symbolsRanking,
      productDistribution,
      portfolioEvolution,
      monthlyPerformance,
      equityCurve,
      riskMetrics,
    ] = await Promise.all([
      this.getAccountBalance(userId, accountId),
      this.getPerformance(userId, period, accountId, product),
      this.getSymbolsRanking(userId, period, accountId, product),
      this.getProductDistribution(userId, accountId),
      this.getPortfolioEvolution(userId, period, accountId, product),
      this.getMonthlyPerformance(userId, accountId, product),
      this.getEquityCurve(userId, period, accountId, product),
      this.getRiskMetrics(userId, period, accountId, product),
    ]);

    return {
      accountBalance,
      performance,
      symbolsRanking,
      productDistribution,
      portfolioEvolution,
      monthlyPerformance,
      equityCurve,
      riskMetrics,
      lastUpdated: new Date().toISOString(),
    };
  }
}
