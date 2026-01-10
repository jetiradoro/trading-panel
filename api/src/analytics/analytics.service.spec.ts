import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Tests unitarios para AnalyticsService
 */
describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    transactions: {
      aggregate: jest.fn(),
      findMany: jest.fn(),
    },
    operations: {
      findMany: jest.fn(),
      aggregate: jest.fn(),
    },
    operation_entries: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAccountBalance', () => {
    it('should return correct account balance', async () => {
      const userId = 'user-1';

      mockPrismaService.transactions.aggregate.mockResolvedValue({
        _sum: { amount: 10000 },
      });

      mockPrismaService.operations.findMany.mockResolvedValue([
        {
          id: 'op-1',
          status: 'open',
          entries: [
            { entryType: 'buy', quantity: 10, price: 100 },
            { entryType: 'sell', quantity: 2, price: 110 },
          ],
        },
      ]);

      const result = await service.getAccountBalance(userId);

      expect(result.totalFromTransactions).toBe(10000);
      expect(result.totalInvested).toBe(780); // (10*100) - (2*110)
      expect(result.availableCash).toBe(9220); // 10000 - 780
    });

    it('should handle zero balance', async () => {
      const userId = 'user-2';

      mockPrismaService.transactions.aggregate.mockResolvedValue({
        _sum: { amount: null },
      });

      mockPrismaService.operations.findMany.mockResolvedValue([]);

      const result = await service.getAccountBalance(userId);

      expect(result.totalFromTransactions).toBe(0);
      expect(result.totalInvested).toBe(0);
      expect(result.availableCash).toBe(0);
    });

    it('should filter by accountId if provided', async () => {
      const userId = 'user-1';
      const accountId = 'account-1';

      mockPrismaService.transactions.aggregate.mockResolvedValue({
        _sum: { amount: 5000 },
      });

      mockPrismaService.operations.findMany.mockResolvedValue([]);

      await service.getAccountBalance(userId, accountId);

      expect(mockPrismaService.transactions.aggregate).toHaveBeenCalledWith({
        where: { userId, accountId },
        _sum: { amount: true },
      });

      expect(mockPrismaService.operations.findMany).toHaveBeenCalledWith({
        where: { userId, status: 'open', accountId },
        include: { entries: true },
      });
    });
  });

  describe('getPerformance', () => {
    it('should calculate realized P&L from closed operations', async () => {
      const userId = 'user-1';
      const period = '30d';

      mockPrismaService.operations.findMany
        .mockResolvedValueOnce([
          { id: 'op-1', status: 'closed', balance: 150 },
          { id: 'op-2', status: 'closed', balance: -50 },
          { id: 'op-3', status: 'closed', balance: 200 },
        ])
        .mockResolvedValueOnce([]);

      const result = await service.getPerformance(userId, period);

      expect(result.realizedPnL).toBe(300); // 150 - 50 + 200
      expect(result.winningOperations).toBe(2);
      expect(result.losingOperations).toBe(1);
      expect(result.winRate).toBe(66.66666666666666); // 2/3 * 100
    });

    it('should calculate unrealized P&L from open operations', async () => {
      const userId = 'user-1';
      const period = '30d';

      mockPrismaService.operations.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([
          {
            id: 'op-1',
            type: 'long',
            status: 'open',
            entries: [{ entryType: 'buy', quantity: 10, price: 100 }],
            symbol: {
              priceHistory: [{ price: 120 }],
            },
          },
        ]);

      const result = await service.getPerformance(userId, period);

      expect(result.unrealizedPnL).toBe(200); // (120 - 100) * 10
      expect(result.totalPnL).toBe(200);
    });

    it('should handle short positions correctly', async () => {
      const userId = 'user-1';
      const period = '30d';

      mockPrismaService.operations.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([
          {
            id: 'op-1',
            type: 'short',
            status: 'open',
            entries: [{ entryType: 'buy', quantity: 10, price: 100 }],
            symbol: {
              priceHistory: [{ price: 90 }],
            },
          },
        ]);

      const result = await service.getPerformance(userId, period);

      expect(result.unrealizedPnL).toBe(100); // (100 - 90) * 10 for short
    });

    it('should return 0 win rate when no operations', async () => {
      const userId = 'user-1';
      const period = '30d';

      mockPrismaService.operations.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const result = await service.getPerformance(userId, period);

      expect(result.winRate).toBe(0);
      expect(result.realizedPnL).toBe(0);
      expect(result.unrealizedPnL).toBe(0);
    });
  });

  describe('getSymbolsRanking', () => {
    it('should group operations by symbol', async () => {
      const userId = 'user-1';
      const period = '30d';

      mockPrismaService.operations.findMany.mockResolvedValue([
        {
          symbolId: 'symbol-1',
          status: 'closed',
          balance: 100,
          symbol: {
            code: 'BTC',
            name: 'Bitcoin',
            logo: null,
            product: 'crypto',
            priceHistory: [{ price: 50000 }],
          },
          entries: [],
        },
        {
          symbolId: 'symbol-1',
          status: 'closed',
          balance: 50,
          symbol: {
            code: 'BTC',
            name: 'Bitcoin',
            logo: null,
            product: 'crypto',
            priceHistory: [{ price: 50000 }],
          },
          entries: [],
        },
      ]);

      const result = await service.getSymbolsRanking(userId, period);

      expect(result).toHaveLength(1);
      expect(result[0].code).toBe('BTC');
      expect(result[0].realizedPnL).toBe(150);
      expect(result[0].operationsCount).toBe(2);
    });

    it('should sort symbols by total P&L descending', async () => {
      const userId = 'user-1';
      const period = '30d';

      mockPrismaService.operations.findMany.mockResolvedValue([
        {
          symbolId: 'symbol-1',
          status: 'closed',
          balance: 100,
          symbol: {
            code: 'BTC',
            name: 'Bitcoin',
            logo: null,
            product: 'crypto',
            priceHistory: [],
          },
          entries: [],
        },
        {
          symbolId: 'symbol-2',
          status: 'closed',
          balance: 200,
          symbol: {
            code: 'ETH',
            name: 'Ethereum',
            logo: null,
            product: 'crypto',
            priceHistory: [],
          },
          entries: [],
        },
      ]);

      const result = await service.getSymbolsRanking(userId, period);

      expect(result[0].code).toBe('ETH');
      expect(result[1].code).toBe('BTC');
    });
  });

  describe('getProductDistribution', () => {
    it('should group operations by product type', async () => {
      const userId = 'user-1';

      mockPrismaService.operations.findMany.mockResolvedValue([
        {
          product: 'crypto',
          entries: [{ entryType: 'buy', quantity: 1, price: 1000 }],
        },
        {
          product: 'crypto',
          entries: [{ entryType: 'buy', quantity: 2, price: 500 }],
        },
        {
          product: 'stock',
          entries: [{ entryType: 'buy', quantity: 10, price: 100 }],
        },
      ]);

      const result = await service.getProductDistribution(userId);

      expect(result).toHaveLength(2);
      const crypto = result.find((p) => p.product === 'crypto');
      const stock = result.find((p) => p.product === 'stock');

      expect(crypto?.totalInvested).toBe(2000); // 1*1000 + 2*500
      expect(stock?.totalInvested).toBe(1000); // 10*100
      expect(crypto?.operationsCount).toBe(2);
      expect(stock?.operationsCount).toBe(1);
    });

    it('should calculate percentages correctly', async () => {
      const userId = 'user-1';

      mockPrismaService.operations.findMany.mockResolvedValue([
        {
          product: 'crypto',
          entries: [{ entryType: 'buy', quantity: 1, price: 750 }],
        },
        {
          product: 'stock',
          entries: [{ entryType: 'buy', quantity: 1, price: 250 }],
        },
      ]);

      const result = await service.getProductDistribution(userId);

      const crypto = result.find((p) => p.product === 'crypto');
      const stock = result.find((p) => p.product === 'stock');

      expect(crypto?.percentage).toBe(75); // 750/1000 * 100
      expect(stock?.percentage).toBe(25); // 250/1000 * 100
    });
  });

  describe('getDashboard', () => {
    it('should return all dashboard data', async () => {
      const userId = 'user-1';
      const period = '30d';

      mockPrismaService.transactions.aggregate.mockResolvedValue({
        _sum: { amount: 10000 },
      });

      mockPrismaService.transactions.findMany.mockResolvedValue([]);
      mockPrismaService.operations.findMany.mockResolvedValue([]);
      mockPrismaService.operation_entries.findMany.mockResolvedValue([]);

      const result = await service.getDashboard(userId, period);

      expect(result).toHaveProperty('accountBalance');
      expect(result).toHaveProperty('performance');
      expect(result).toHaveProperty('symbolsRanking');
      expect(result).toHaveProperty('productDistribution');
      expect(result).toHaveProperty('portfolioEvolution');
      expect(result).toHaveProperty('monthlyPerformance');
      expect(result).toHaveProperty('equityCurve');
      expect(result).toHaveProperty('riskMetrics');
      expect(result).toHaveProperty('lastUpdated');
    });
  });

  describe('getMonthlyPerformance', () => {
    it('should group operations by month', async () => {
      const userId = 'user-1';

      mockPrismaService.operations.findMany.mockResolvedValue([
        {
          balance: 100,
          updatedAt: new Date('2024-01-15'),
        },
        {
          balance: 50,
          updatedAt: new Date('2024-01-20'),
        },
        {
          balance: -30,
          updatedAt: new Date('2024-02-10'),
        },
      ]);

      const result = await service.getMonthlyPerformance(userId);

      expect(result).toHaveLength(2);
      expect(result[0].month).toBe('Ene');
      expect(result[0].pnl).toBe(150);
      expect(result[0].operationsClosed).toBe(2);
      expect(result[1].month).toBe('Feb');
      expect(result[1].pnl).toBe(-30);
    });

    it('should calculate win rate correctly', async () => {
      const userId = 'user-1';

      mockPrismaService.operations.findMany.mockResolvedValue([
        { balance: 100, updatedAt: new Date('2024-01-15') },
        { balance: 50, updatedAt: new Date('2024-01-20') },
        { balance: -30, updatedAt: new Date('2024-01-25') },
      ]);

      const result = await service.getMonthlyPerformance(userId);

      expect(result[0].winRate).toBeCloseTo(66.67, 1); // 2 wins out of 3 ops
    });

    it('should return empty array when no operations', async () => {
      const userId = 'user-1';

      mockPrismaService.operations.findMany.mockResolvedValue([]);

      const result = await service.getMonthlyPerformance(userId);

      expect(result).toEqual([]);
    });
  });

  describe('getEquityCurve', () => {
    it('should calculate equity from transactions and operations', async () => {
      const userId = 'user-1';
      const period = '7d';

      mockPrismaService.transactions.findMany.mockResolvedValue([
        { amount: 1000, date: new Date('2024-01-01') },
        { amount: 500, date: new Date('2024-01-02') },
      ]);

      mockPrismaService.operations.findMany.mockResolvedValue([
        { balance: 100, updatedAt: new Date('2024-01-03') },
      ]);

      const result = await service.getEquityCurve(userId, period);

      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('date');
      expect(result[0]).toHaveProperty('equity');
      expect(result[0]).toHaveProperty('deposits');
      expect(result[0]).toHaveProperty('withdrawals');
      expect(result[0]).toHaveProperty('pnl');
    });

    it('should separate deposits and withdrawals', async () => {
      const userId = 'user-1';
      const period = '7d';

      mockPrismaService.transactions.findMany.mockResolvedValue([
        { amount: 1000, date: new Date('2024-01-01') },
        { amount: -200, date: new Date('2024-01-02') },
      ]);

      mockPrismaService.operations.findMany.mockResolvedValue([]);

      const result = await service.getEquityCurve(userId, period);

      expect(result.length).toBeGreaterThan(0);
      const lastPoint = result[result.length - 1];
      expect(lastPoint.deposits).toBe(1000);
      expect(lastPoint.withdrawals).toBe(200);
    });
  });

  describe('getRiskMetrics', () => {
    it('should calculate basic risk metrics', async () => {
      const userId = 'user-1';
      const period = '30d';

      mockPrismaService.operations.findMany.mockResolvedValue([
        { balance: 100 },
        { balance: 50 },
        { balance: -30 },
        { balance: -20 },
      ]);

      const result = await service.getRiskMetrics(userId, period);

      expect(result.avgWin).toBe(75); // (100 + 50) / 2
      expect(result.avgLoss).toBe(25); // (30 + 20) / 2
      expect(result.profitFactor).toBe(3); // 150 / 50
      expect(result.largestWin).toBe(100);
      expect(result.largestLoss).toBe(30); // Math.abs(-30)
    });

    it('should return zeros when no operations', async () => {
      const userId = 'user-1';
      const period = '30d';

      mockPrismaService.operations.findMany.mockResolvedValue([]);

      const result = await service.getRiskMetrics(userId, period);

      expect(result.sharpeRatio).toBe(0);
      expect(result.maxDrawdown).toBe(0);
      expect(result.profitFactor).toBe(0);
      expect(result.avgWin).toBe(0);
      expect(result.avgLoss).toBe(0);
    });

    it('should handle only winning operations', async () => {
      const userId = 'user-1';
      const period = '30d';

      mockPrismaService.operations.findMany.mockResolvedValue([
        { balance: 100 },
        { balance: 50 },
      ]);

      const result = await service.getRiskMetrics(userId, period);

      expect(result.avgWin).toBe(75);
      expect(result.avgLoss).toBe(0);
      expect(result.profitFactor).toBe(999); // Cuando solo hay ganancias
    });

    it('should handle only losing operations', async () => {
      const userId = 'user-1';
      const period = '30d';

      mockPrismaService.operations.findMany.mockResolvedValue([
        { balance: -100 },
        { balance: -50 },
      ]);

      const result = await service.getRiskMetrics(userId, period);

      expect(result.avgWin).toBe(0);
      expect(result.avgLoss).toBe(75);
      expect(result.profitFactor).toBe(0);
    });
  });
});
