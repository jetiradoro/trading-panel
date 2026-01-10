import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { AuthGuard } from '../auth/guards/auth.guard';

/**
 * Tests unitarios para AnalyticsController
 */
describe('AnalyticsController', () => {
  let controller: AnalyticsController;
  let service: AnalyticsService;

  const mockAnalyticsService = {
    getDashboard: jest.fn(),
    getAccountBalance: jest.fn(),
    getPerformance: jest.fn(),
    getSymbolsRanking: jest.fn(),
    getProductDistribution: jest.fn(),
    getPortfolioEvolution: jest.fn(),
  };

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashed',
    refresh_token: null,
    token_expiration: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [
        {
          provide: AnalyticsService,
          useValue: mockAnalyticsService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<AnalyticsController>(AnalyticsController);
    service = module.get<AnalyticsService>(AnalyticsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getDashboard', () => {
    it('should call service with correct parameters', async () => {
      const query = { period: '30d' as const, accountId: undefined };
      const mockResult = {
        accountBalance: {
          totalFromTransactions: 10000,
          totalInvested: 5000,
          availableCash: 5000,
        },
        performance: {
          realizedPnL: 100,
          unrealizedPnL: 50,
          totalPnL: 150,
          totalPnLPercentage: 3,
          winningOperations: 5,
          losingOperations: 2,
          winRate: 71.43,
        },
        symbolsRanking: [],
        productDistribution: [],
        portfolioEvolution: [],
        lastUpdated: new Date().toISOString(),
      };

      mockAnalyticsService.getDashboard.mockResolvedValue(mockResult);

      const result = await controller.getDashboard(mockUser, query);

      expect(service.getDashboard).toHaveBeenCalledWith(
        mockUser.id,
        '30d',
        undefined,
      );
      expect(result).toEqual(mockResult);
    });

    it('should pass accountId when provided', async () => {
      const query = { period: '7d' as const, accountId: 'account-123' };

      mockAnalyticsService.getDashboard.mockResolvedValue({} as any);

      await controller.getDashboard(mockUser, query);

      expect(service.getDashboard).toHaveBeenCalledWith(
        mockUser.id,
        '7d',
        'account-123',
      );
    });
  });

  describe('getAccountBalance', () => {
    it('should return account balance', async () => {
      const query = { period: undefined, accountId: undefined };
      const mockBalance = {
        totalFromTransactions: 10000,
        totalInvested: 6000,
        availableCash: 4000,
      };

      mockAnalyticsService.getAccountBalance.mockResolvedValue(mockBalance);

      const result = await controller.getAccountBalance(mockUser, query);

      expect(service.getAccountBalance).toHaveBeenCalledWith(
        mockUser.id,
        undefined,
      );
      expect(result).toEqual(mockBalance);
    });

    it('should filter by accountId', async () => {
      const query = { period: undefined, accountId: 'account-456' };

      mockAnalyticsService.getAccountBalance.mockResolvedValue({} as any);

      await controller.getAccountBalance(mockUser, query);

      expect(service.getAccountBalance).toHaveBeenCalledWith(
        mockUser.id,
        'account-456',
      );
    });
  });

  describe('getPerformance', () => {
    it('should return performance metrics', async () => {
      const query = { period: '90d' as const, accountId: undefined };
      const mockPerformance = {
        realizedPnL: 500,
        unrealizedPnL: 200,
        totalPnL: 700,
        totalPnLPercentage: 10,
        winningOperations: 8,
        losingOperations: 3,
        winRate: 72.73,
      };

      mockAnalyticsService.getPerformance.mockResolvedValue(mockPerformance);

      const result = await controller.getPerformance(mockUser, query);

      expect(service.getPerformance).toHaveBeenCalledWith(
        mockUser.id,
        '90d',
        undefined,
      );
      expect(result).toEqual(mockPerformance);
    });

    it('should use default period 30d when not provided', async () => {
      const query = { period: undefined, accountId: undefined };

      mockAnalyticsService.getPerformance.mockResolvedValue({} as any);

      await controller.getPerformance(mockUser, query);

      expect(service.getPerformance).toHaveBeenCalledWith(
        mockUser.id,
        '30d',
        undefined,
      );
    });
  });

  describe('getSymbolsRanking', () => {
    it('should return symbols ranking', async () => {
      const query = { period: '1y' as const, accountId: undefined };
      const mockRanking = [
        {
          symbolId: 'sym-1',
          code: 'BTC',
          name: 'Bitcoin',
          logo: null,
          product: 'crypto',
          totalInvested: 5000,
          realizedPnL: 500,
          unrealizedPnL: 200,
          totalPnL: 700,
          pnlPercentage: 14,
          operationsCount: 3,
          sparklineData: [45000, 46000, 47000],
        },
      ];

      mockAnalyticsService.getSymbolsRanking.mockResolvedValue(mockRanking);

      const result = await controller.getSymbolsRanking(mockUser, query);

      expect(service.getSymbolsRanking).toHaveBeenCalledWith(
        mockUser.id,
        '1y',
        undefined,
      );
      expect(result).toEqual(mockRanking);
    });

    it('should use default period when not specified', async () => {
      const query = { period: undefined, accountId: undefined };

      mockAnalyticsService.getSymbolsRanking.mockResolvedValue([]);

      await controller.getSymbolsRanking(mockUser, query);

      expect(service.getSymbolsRanking).toHaveBeenCalledWith(
        mockUser.id,
        '30d',
        undefined,
      );
    });
  });

  describe('getProductDistribution', () => {
    it('should return product distribution', async () => {
      const query = { period: undefined, accountId: undefined };
      const mockDistribution = [
        {
          product: 'crypto',
          label: 'Cripto',
          totalInvested: 6000,
          percentage: 60,
          operationsCount: 5,
          pnl: 0,
        },
        {
          product: 'stock',
          label: 'Acciones',
          totalInvested: 4000,
          percentage: 40,
          operationsCount: 3,
          pnl: 0,
        },
      ];

      mockAnalyticsService.getProductDistribution.mockResolvedValue(
        mockDistribution,
      );

      const result = await controller.getProductDistribution(mockUser, query);

      expect(service.getProductDistribution).toHaveBeenCalledWith(
        mockUser.id,
        undefined,
      );
      expect(result).toEqual(mockDistribution);
    });
  });

  describe('getPortfolioEvolution', () => {
    it('should return portfolio evolution data', async () => {
      const query = { period: 'all' as const, accountId: undefined };
      const mockEvolution = [
        {
          date: '2024-01-01',
          totalInvested: 5000,
          portfolioValue: 5200,
          pnl: 200,
        },
        {
          date: '2024-01-02',
          totalInvested: 6000,
          portfolioValue: 6300,
          pnl: 300,
        },
      ];

      mockAnalyticsService.getPortfolioEvolution.mockResolvedValue(
        mockEvolution,
      );

      const result = await controller.getPortfolioEvolution(mockUser, query);

      expect(service.getPortfolioEvolution).toHaveBeenCalledWith(
        mockUser.id,
        'all',
        undefined,
      );
      expect(result).toEqual(mockEvolution);
    });

    it('should use default period when not provided', async () => {
      const query = { period: undefined, accountId: undefined };

      mockAnalyticsService.getPortfolioEvolution.mockResolvedValue([]);

      await controller.getPortfolioEvolution(mockUser, query);

      expect(service.getPortfolioEvolution).toHaveBeenCalledWith(
        mockUser.id,
        '30d',
        undefined,
      );
    });
  });
});
