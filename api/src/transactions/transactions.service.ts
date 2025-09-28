import { Injectable } from '@nestjs/common';
import { transactions } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { NewTransactionDto } from './dtos/NewTransactionDto';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  getTransactions(filter: object): Promise<Array<transactions>> {
    return this.prisma.transactions.findMany(filter);
  }

  createTransaction(data: NewTransactionDto): Promise<transactions> {
    return this.prisma.transactions.create({ data });
  }

  removeTransaction(id: string) {
    return this.prisma.transactions.delete({ where: { id } });
  }
}
