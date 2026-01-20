import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Controlador de configuracion de proveedores de mercado.
 */
@Controller('market-data')
export class MarketDataController {
  constructor(private readonly config: ConfigService) {}

  /**
   * Lista proveedores configurados y default.
   */
  @Get('providers')
  getProviders() {
    return {
      providers: this.config.get('market_data.providers') || [],
      defaultProvider: this.config.get('market_data.provider') || 'eodhd',
    };
  }
}
