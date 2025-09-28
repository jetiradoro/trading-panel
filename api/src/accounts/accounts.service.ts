import { Injectable } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { accounts } from '@prisma/client';
import { toBoolean } from '../common/helpers/utils.helper';

@Injectable()
export class AccountsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateAccountDto) {
    data.active = toBoolean(data.active);
    data.balance = Number(data.balance);

    if (data.active) {
      await this.prisma.accounts.updateMany({
        where: { userId: data.userId, active: true },
        data: { active: false },
      });
    }
    return this.prisma.accounts.create({ data });
  }

  findAll(userId: string): Promise<accounts[]> {
    return this.prisma.accounts.findMany({
      where: { userId: userId },
    });
  }

  findBy(filter: any): Promise<accounts | null> {
    return this.prisma.accounts.findFirst({
      where: filter,
    });
  }

  update(id: string, data: UpdateAccountDto): Promise<accounts> {
    return this.prisma.accounts.update({
      where: { id },
      data,
    });
  }

  remove(id: string) {
    return this.prisma.accounts.delete({ where: { id } });
  }

  findCurrentAccount(userId: string): Promise<accounts | null> {
    return this.prisma.accounts.findFirst({
      where: { userId: userId, active: true },
    });
  }
}
