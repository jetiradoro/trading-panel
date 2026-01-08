import { Test, TestingModule } from '@nestjs/testing';
import { SymbolsService } from './symbols.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('SymbolsService', () => {
  let service: SymbolsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    symbols: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockSymbol = {
    id: 'symbol-1',
    code: 'BTC',
    name: 'Bitcoin',
    logo: 'https://logo.url',
    product: 'crypto',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SymbolsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<SymbolsService>(SymbolsService);
    prisma = module.get<PrismaService>(PrismaService);

    // Limpiar mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto = {
      code: 'BTC',
      name: 'Bitcoin',
      logo: 'https://logo.url',
      product: 'crypto',
    };

    it('should create a symbol successfully', async () => {
      mockPrismaService.symbols.findUnique.mockResolvedValue(null);
      mockPrismaService.symbols.create.mockResolvedValue(mockSymbol);

      const result = await service.create(createDto);

      expect(prisma.symbols.findUnique).toHaveBeenCalledWith({
        where: { code: 'BTC' },
      });
      expect(prisma.symbols.create).toHaveBeenCalledWith({ data: createDto });
      expect(result).toEqual(mockSymbol);
    });

    it('should throw ConflictException if code already exists', async () => {
      mockPrismaService.symbols.findUnique.mockResolvedValue(mockSymbol);

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
      expect(prisma.symbols.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return array of symbols ordered by code', async () => {
      const symbols = [mockSymbol];
      mockPrismaService.symbols.findMany.mockResolvedValue(symbols);

      const result = await service.findAll();

      expect(prisma.symbols.findMany).toHaveBeenCalledWith({
        orderBy: { code: 'asc' },
      });
      expect(result).toEqual(symbols);
    });
  });

  describe('search', () => {
    it('should search symbols by code or name', async () => {
      const symbols = [mockSymbol];
      mockPrismaService.symbols.findMany.mockResolvedValue(symbols);

      const result = await service.search('BTC');

      expect(prisma.symbols.findMany).toHaveBeenCalledWith({
        where: {
          OR: [{ code: { contains: 'BTC' } }, { name: { contains: 'BTC' } }],
        },
        orderBy: { code: 'asc' },
      });
      expect(result).toEqual(symbols);
    });
  });

  describe('findOne', () => {
    it('should return a symbol by id', async () => {
      mockPrismaService.symbols.findUnique.mockResolvedValue(mockSymbol);

      const result = await service.findOne('symbol-1');

      expect(prisma.symbols.findUnique).toHaveBeenCalledWith({
        where: { id: 'symbol-1' },
      });
      expect(result).toEqual(mockSymbol);
    });

    it('should throw NotFoundException if symbol not found', async () => {
      mockPrismaService.symbols.findUnique.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByCode', () => {
    it('should return a symbol by code', async () => {
      mockPrismaService.symbols.findUnique.mockResolvedValue(mockSymbol);

      const result = await service.findByCode('BTC');

      expect(prisma.symbols.findUnique).toHaveBeenCalledWith({
        where: { code: 'BTC' },
      });
      expect(result).toEqual(mockSymbol);
    });

    it('should return null if symbol not found', async () => {
      mockPrismaService.symbols.findUnique.mockResolvedValue(null);

      const result = await service.findByCode('INVALID');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    const updateDto = { name: 'Bitcoin Updated' };

    it('should update a symbol successfully', async () => {
      mockPrismaService.symbols.findUnique.mockResolvedValue(mockSymbol);
      mockPrismaService.symbols.update.mockResolvedValue({
        ...mockSymbol,
        ...updateDto,
      });

      const result = await service.update('symbol-1', updateDto);

      expect(prisma.symbols.findUnique).toHaveBeenCalledWith({
        where: { id: 'symbol-1' },
      });
      expect(prisma.symbols.update).toHaveBeenCalledWith({
        where: { id: 'symbol-1' },
        data: updateDto,
      });
      expect(result.name).toBe('Bitcoin Updated');
    });

    it('should throw NotFoundException if symbol not found', async () => {
      mockPrismaService.symbols.findUnique.mockResolvedValue(null);

      await expect(service.update('invalid-id', updateDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.symbols.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if new code already exists', async () => {
      mockPrismaService.symbols.findUnique.mockResolvedValue(mockSymbol);
      mockPrismaService.symbols.findFirst.mockResolvedValue({
        ...mockSymbol,
        id: 'other-symbol',
      });

      await expect(service.update('symbol-1', { code: 'ETH' })).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a symbol successfully', async () => {
      mockPrismaService.symbols.findUnique.mockResolvedValue(mockSymbol);
      mockPrismaService.symbols.delete.mockResolvedValue(mockSymbol);

      const result = await service.remove('symbol-1');

      expect(prisma.symbols.findUnique).toHaveBeenCalledWith({
        where: { id: 'symbol-1' },
      });
      expect(prisma.symbols.delete).toHaveBeenCalledWith({
        where: { id: 'symbol-1' },
      });
      expect(result).toEqual(mockSymbol);
    });

    it('should throw NotFoundException if symbol not found', async () => {
      mockPrismaService.symbols.findUnique.mockResolvedValue(null);

      await expect(service.remove('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.symbols.delete).not.toHaveBeenCalled();
    });
  });
});
