import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import * as argon2 from 'argon2';

@Injectable()
export class PasswordHelper {
  static hashPassword(password: string): string {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
  }

  static comparePassword(password: string, password_db: string): boolean {
    return bcrypt.compareSync(password, password_db);
  }

  static generateRandomPassword(length: number = 64): string {
    const hash = randomBytes(64).toString('base64url');
    return hash;
  }
}
