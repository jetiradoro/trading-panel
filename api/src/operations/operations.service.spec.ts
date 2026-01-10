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
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
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
          price_history: {
            create: jest.fn().mockResolvedValue(mockPrice),
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
          symbol: {
            include: {
              priceHistory: {
                orderBy: { date: 'desc' },
                take: 1,
              },
            },
          },
          account: true,
          entries: {
            orderBy: { date: 'asc' },
          },
        },
      });
      // Al ser operaciones abiertas, se agregan métricas
      expect(result[0]).toHaveProperty('metrics');
    });

    it('should return operations without optional filters', async () => {
      const operations = [mockOperation];
      mockPrismaService.operations.findMany.mockResolvedValue(operations);

      const result = await service.findAll({ userId: 'user-1' });

      expect(prisma.operations.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        include: {
          symbol: {
            include: {
              priceHistory: {
                orderBy: { date: 'desc' },
                take: 1,
              },
            },
          },
          account: true,
          entries: {
            orderBy: { date: 'asc' },
          },
        },
      });
      // Al ser operaciones abiertas, se agregan métricas
      expect(result[0]).toHaveProperty('metrics');
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
          symbol: {
            include: {
              priceHistory: {
                orderBy: { date: 'desc' },
                take: 1,
              },
            },
          },
          account: true,
          entries: {
            orderBy: { date: 'asc' },
          },
        },
      });
      expect(result).toBeDefined();
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
      const mockTx = {
        operation_entries: {
          create: jest.fn().mockResolvedValue(mockEntry),
          findMany: jest.fn().mockResolvedValue([]),
        },
        operations: {
          update: jest.fn(),
        },
      };

      mockPrismaService.operations.findUnique.mockResolvedValue(mockOperation);
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback(mockTx);
      });

      const result = await service.addEntry('op-1', entryDto);

      expect(prisma.operations.findUnique).toHaveBeenCalledWith({
        where: { id: 'op-1' },
      });
      expect(result).toEqual(mockEntry);
    });

    it('should throw NotFoundException if operation not found', async () => {
      mockPrismaService.operations.findUnique.mockResolvedValue(null);

      await expect(service.addEntry('invalid-id', entryDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should close operation and calculate balance when quantities match', async () => {
      const entryDtoSell = {
        ...entryDto,
        entryType: 'sell',
        quantity: 1,
        price: 120,
        tax: 10,
      };
      const mockTx = {
        operation_entries: {
          create: jest.fn().mockResolvedValue(mockEntry),
          findMany: jest.fn().mockResolvedValue([
            {
              ...mockEntry,
              entryType: 'buy',
              quantity: 1,
              price: 100,
              tax: 10,
            },
            {
              ...mockEntry,
              id: 'entry-2',
              entryType: 'sell',
              quantity: 1,
              price: 120,
              tax: 10,
            },
          ]),
        },
        operations: {
          update: jest.fn(),
        },
      };

      mockPrismaService.operations.findUnique.mockResolvedValue({
        ...mockOperation,
        type: 'long',
      });
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback(mockTx);
      });

      const result = await service.addEntry('op-1', entryDtoSell);

      expect(result).toEqual(mockEntry);
      expect(mockTx.operations.update).toHaveBeenCalledWith({
        where: { id: 'op-1' },
        data: { status: 'closed', balance: 20 },
      });
    });

    it('should keep operation open when quantities do not match', async () => {
      const mockTx = {
        operation_entries: {
          create: jest.fn().mockResolvedValue(mockEntry),
          findMany: jest.fn().mockResolvedValue([
            {
              ...mockEntry,
              entryType: 'buy',
              quantity: 2,
              price: 100,
              tax: 10,
            },
            {
              ...mockEntry,
              id: 'entry-2',
              entryType: 'sell',
              quantity: 1,
              price: 120,
              tax: 10,
            },
          ]),
        },
        operations: {
          update: jest.fn(),
        },
      };

      mockPrismaService.operations.findUnique.mockResolvedValue(mockOperation);
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback(mockTx);
      });

      const result = await service.addEntry('op-1', entryDto);

      expect(result).toEqual(mockEntry);
      expect(mockTx.operations.update).not.toHaveBeenCalled();
    });
  });

  describe('updateEntry', () => {
    const updateDto = {
      quantity: 2.0,
      price: 52000,
    };

    it('should update entry in operation', async () => {
      const updatedEntry = { ...mockEntry, ...updateDto };
      mockPrismaService.operation_entries.findUnique.mockResolvedValue(
        mockEntry,
      );
      mockPrismaService.operation_entries.update.mockResolvedValue(
        updatedEntry,
      );

      const result = await service.updateEntry('op-1', 'entry-1', updateDto);

      expect(prisma.operation_entries.findUnique).toHaveBeenCalledWith({
        where: { id: 'entry-1' },
      });
      expect(prisma.operation_entries.update).toHaveBeenCalledWith({
        where: { id: 'entry-1' },
        data: updateDto,
      });
      expect(result).toEqual(updatedEntry);
    });

    it('should throw NotFoundException if entry not found', async () => {
      mockPrismaService.operation_entries.findUnique.mockResolvedValue(null);

      await expect(
        service.updateEntry('op-1', 'invalid-id', updateDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if entry does not belong to operation', async () => {
      mockPrismaService.operation_entries.findUnique.mockResolvedValue({
        ...mockEntry,
        operationId: 'other-op',
      });

      await expect(
        service.updateEntry('op-1', 'entry-1', updateDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeEntry', () => {
    it('should remove entry from operation', async () => {
      const mockTx = {
        operation_entries: {
          findUnique: jest.fn().mockResolvedValue(mockEntry),
          delete: jest.fn().mockResolvedValue(mockEntry),
        },
        operations: {
          findUnique: jest.fn().mockResolvedValue(mockOperation),
          update: jest.fn(),
        },
      };
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback(mockTx);
      });

      const result = await service.removeEntry('op-1', 'entry-1');

      expect(mockTx.operation_entries.findUnique).toHaveBeenCalledWith({
        where: { id: 'entry-1' },
      });
      expect(mockTx.operation_entries.delete).toHaveBeenCalledWith({
        where: { id: 'entry-1' },
      });
      expect(result).toEqual(mockEntry);
    });

    it('should throw NotFoundException if entry not found', async () => {
      const mockTx = {
        operation_entries: {
          findUnique: jest.fn().mockResolvedValue(null),
        },
        operations: {
          findUnique: jest.fn().mockResolvedValue(mockOperation),
        },
      };
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback(mockTx);
      });

      await expect(service.removeEntry('op-1', 'invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if entry does not belong to operation', async () => {
      const mockTx = {
        operation_entries: {
          findUnique: jest.fn().mockResolvedValue({
            ...mockEntry,
            operationId: 'other-op',
          }),
        },
        operations: {
          findUnique: jest.fn().mockResolvedValue(mockOperation),
        },
      };
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback(mockTx);
      });

      await expect(service.removeEntry('op-1', 'entry-1')).rejects.toThrow(
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
