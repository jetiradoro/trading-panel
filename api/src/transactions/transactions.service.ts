import { Injectable } from '@nestjs/common';
import { transactions } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NewTransactionDto } from './dtos/NewTransactionDto';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  getTransactions(filter: object): Promise<Array<transactions>> {
    return this.prisma.transactions.findMany({
      ...filter,
      orderBy: { date: 'desc' },
    });
  }

  createTransaction(data: NewTransactionDto): Promise<transactions> {
    return this.prisma.transactions.create({ data });
  }

  async removeTransaction(id: string, userId: string, accountId: string) {
    const result = await this.prisma.transactions.deleteMany({
      where: { id, userId, accountId },
    });
    if (result.count === 0) {
      throw new Error('Transaction not found');
    }
    return true;
  }
}
