import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { Injectable } from '@nestjs/common';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  email: string;
  name: string;
  password?: string;
}
