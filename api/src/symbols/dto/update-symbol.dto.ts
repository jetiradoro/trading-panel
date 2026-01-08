import { PartialType } from '@nestjs/mapped-types';
import { CreateSymbolDto } from './create-symbol.dto';

/**
 * DTO para actualizar un símbolo
 */
export class UpdateSymbolDto extends PartialType(CreateSymbolDto) {}
