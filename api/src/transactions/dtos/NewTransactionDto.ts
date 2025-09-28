import { IsDate, IsDateString, IsNotEmpty, IsOptional } from 'class-validator';

export class NewTransactionDto {
  @IsNotEmpty()
  amount: number;
  @IsNotEmpty()
  origin: string;

  @IsNotEmpty()
  date: Date;

  @IsOptional()
  description: string;

  accountId: string;
  userId: string;
}
