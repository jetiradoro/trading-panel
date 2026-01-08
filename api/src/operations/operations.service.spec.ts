import { Test, TestingModule } from '@nestjs/testing';
import { OperationsService } from './operations.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('OperationsService', () => {
  let service: OperationsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    operations: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    operation_entries: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    price_history: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockOperation = {
    id: 'op-1',
    accountId: 'acc-1',
    userId: 'user-1',
    symbolId: 'symbol-1',
    product: 'crypto',
    type: 'long',
    status: 'open',
    balance: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockEntry = {
    id: 'entry-1',
    operationId: 'op-1',
    entryType: 'buy',
    quantity: 1.5,
    price: 50000,
    tax: 10,
    date: new Date(),
    createdAt: new Date(),
  };

  const mockPrice = {
    id: 'price-1',
    operationId: 'op-1',
    price: 51000,
    date: new Date(),
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OperationsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<OperationsService>(OperationsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto = {
      accountId: 'acc-1',
      userId: 'user-1',
      symbolId: 'symbol-1',
      product: 'crypto',
      type: 'long',
    };

    it('should create operation without first entry', async () => {
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          operations: {
            create: jest.fn().mockResolvedValue(mockOperation),
          },
          operation_entries: {
            create: jest.fn(),
          },
        };
        return callback(mockTx);
      });

      const result = await service.create(createDto);

      expect(result).toEqual(mockOperation);
    });

    it('should create operation with first entry', async () => {
      const createDtoWithEntry = {
        ...createDto,
        firstEntry: {
          entryType: 'buy',
          quantity: 1.5,
          price: 50000,
          tax: 10,
          date: '2024-01-01T00:00:00.000Z',
        },
      };

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          operations: {
            create: jest.fn().mockResolvedValue(mockOperation),
          },
          operation_entries: {
            create: jest.fn().mockResolvedValue(mockEntry),
          },
        };
        return callback(mockTx);
      });

      const result = await service.create(createDtoWithEntry);

      expect(result).toEqual(mockOperation);
    });
  });

  describe('findAll', () => {
    it('should return operations with filters', async () => {
      const operations = [mockOperation];
      mockPrismaService.operations.findMany.mockResolvedValue(operations);

      const result = await service.findAll({
        userId: 'user-1',
        status: 'open',
        product: 'crypto',
      });

      expect(prisma.operations.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
          status: 'open',
          product: 'crypto',
        },
        include: {
          symbol: true,
          account: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(operations);
    });

    it('should return operations without optional filters', async () => {
      const operations = [mockOperation];
      mockPrismaService.operations.findMany.mockResolvedValue(operations);

      const result = await service.findAll({ userId: 'user-1' });

      expect(prisma.operations.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        include: {
          symbol: true,
          account: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(operations);
    });
  });

  describe('findOne', () => {
    it('should return operation with details', async () => {
      const operationWithDetails = {
        ...mockOperation,
        symbol: { code: 'BTC', name: 'Bitcoin' },
        account: { name: 'Main Account' },
        entries: [mockEntry],
        prices: [mockPrice],
      };

      mockPrismaService.operations.findUnique.mockResolvedValue(
        operationWithDetails,
      );

      const result = await service.findOne('op-1');

      expect(prisma.operations.findUnique).toHaveBeenCalledWith({
        where: { id: 'op-1' },
        include: {
          symbol: true,
          account: true,
          entries: { orderBy: { date: 'asc' } },
          prices: { orderBy: { date: 'desc' } },
        },
      });
      expect(result).toEqual(operationWithDetails);
    });

    it('should throw NotFoundException if operation not found', async () => {
      mockPrismaService.operations.findUnique.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('addEntry', () => {
    const entryDto = {
      entryType: 'buy',
      quantity: 1.5,
      price: 50000,
      tax: 10,
      date: '2024-01-01T00:00:00.000Z',
    };

    it('should add entry to operation', async () => {
      mockPrismaService.operations.findUnique.mockResolvedValue(mockOperation);
      mockPrismaService.operation_entries.create.mockResolvedValue(mockEntry);

      const result = await service.addEntry('op-1', entryDto);

      expect(prisma.operations.findUnique).toHaveBeenCalledWith({
        where: { id: 'op-1' },
      });
      expect(prisma.operation_entries.create).toHaveBeenCalledWith({
        data: {
          operationId: 'op-1',
          entryType: 'buy',
          quantity: 1.5,
          price: 50000,
          tax: 10,
          date: new Date('2024-01-01T00:00:00.000Z'),
        },
      });
      expect(result).toEqual(mockEntry);
    });

    it('should throw NotFoundException if operation not found', async () => {
      mockPrismaService.operations.findUnique.mockResolvedValue(null);

      await expect(service.addEntry('invalid-id', entryDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('removeEntry', () => {
    it('should remove entry from operation', async () => {
      mockPrismaService.operation_entries.findUnique.mockResolvedValue(
        mockEntry,
      );
      mockPrismaService.operation_entries.delete.mockResolvedValue(mockEntry);

      const result = await service.removeEntry('op-1', 'entry-1');

      expect(prisma.operation_entries.findUnique).toHaveBeenCalledWith({
        where: { id: 'entry-1' },
      });
      expect(prisma.operation_entries.delete).toHaveBeenCalledWith({
        where: { id: 'entry-1' },
      });
      expect(result).toEqual(mockEntry);
    });

    it('should throw NotFoundException if entry not found', async () => {
      mockPrismaService.operation_entries.findUnique.mockResolvedValue(null);

      await expect(service.removeEntry('op-1', 'invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if entry does not belong to operation', async () => {
      mockPrismaService.operation_entries.findUnique.mockResolvedValue({
        ...mockEntry,
        operationId: 'other-op',
      });

      await expect(service.removeEntry('op-1', 'entry-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('addPrice', () => {
    const priceDto = {
      price: 51000,
      date: '2024-01-01T00:00:00.000Z',
    };

    it('should add price history to operation', async () => {
      mockPrismaService.operations.findUnique.mockResolvedValue(mockOperation);
      mockPrismaService.price_history.create.mockResolvedValue(mockPrice);

      const result = await service.addPrice('op-1', priceDto);

      expect(prisma.operations.findUnique).toHaveBeenCalledWith({
        where: { id: 'op-1' },
      });
      expect(prisma.price_history.create).toHaveBeenCalledWith({
        data: {
          operationId: 'op-1',
          price: 51000,
          date: new Date('2024-01-01T00:00:00.000Z'),
        },
      });
      expect(result).toEqual(mockPrice);
    });

    it('should throw NotFoundException if operation not found', async () => {
      mockPrismaService.operations.findUnique.mockResolvedValue(null);

      await expect(service.addPrice('invalid-id', priceDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete operation', async () => {
      mockPrismaService.operations.findUnique.mockResolvedValue(mockOperation);
      mockPrismaService.operations.delete.mockResolvedValue(mockOperation);

      const result = await service.remove('op-1');

      expect(prisma.operations.findUnique).toHaveBeenCalledWith({
        where: { id: 'op-1' },
      });
      expect(prisma.operations.delete).toHaveBeenCalledWith({
        where: { id: 'op-1' },
      });
      expect(result).toEqual(mockOperation);
    });

    it('should throw NotFoundException if operation not found', async () => {
      mockPrismaService.operations.findUnique.mockResolvedValue(null);

      await expect(service.remove('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
