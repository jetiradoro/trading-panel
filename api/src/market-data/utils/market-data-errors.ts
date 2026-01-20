import {
  BadGatewayException,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import axios from 'axios';

/**
 * Mapea errores del proveedor externo a excepciones HTTP estandar.
 */
export function mapMarketDataError(error: unknown, symbolCode?: string): never {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status === 401 || status === 403) {
      throw new UnauthorizedException(
        'Credenciales invalidas para el proveedor de mercado',
      );
    }
    if (status === 404) {
      const code = symbolCode ? ` ${symbolCode}` : '';
      throw new NotFoundException(
        `El código${code} es incorrecto o no se encuentra`,
      );
    }
    if (status === 429) {
      throw new HttpException(
        'Limite de peticiones excedido en el proveedor de mercado',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    if (status && status >= 500) {
      throw new ServiceUnavailableException('Proveedor de mercado no disponible');
    }
    if (status) {
      throw new BadGatewayException(
        `Error en proveedor de mercado (status ${status})`,
      );
    }
  }

  throw error;
}
