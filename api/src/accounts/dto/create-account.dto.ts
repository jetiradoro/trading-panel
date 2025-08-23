import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateAccountDto {
  userId: string;

  @IsNotEmpty()
  active: boolean;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  balance: number;

  createdAt?: Date;
  updatedAt?: Date;
}
