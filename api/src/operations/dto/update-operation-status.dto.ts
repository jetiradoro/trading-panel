import { IsIn } from 'class-validator';

/**
 * DTO para actualizar manualmente el estado de una operación
 */
export class UpdateOperationStatusDto {
  @IsIn(['open', 'closed'])
  status!: 'open' | 'closed';
}
