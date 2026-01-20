import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MarketDataProvider,
  MarketProduct,
  MarketQuote,
} from './providers/market-data.provider';

/**
 * Servicio para resolver proveedor y obtener precios de mercado.
 */
@Injectable()
export class MarketDataService {
  /**
   * Inyecta proveedores disponibles.
   */
  constructor(
    @Inject('MARKET_DATA_PROVIDERS')
    private readonly providers: MarketDataProvider[],
    private readonly config: ConfigService,
  ) {}

  /**
   * Obtiene el ultimo precio segun el proveedor configurado.
   */
  async getLatestPrice(
    symbolCode: string,
    product: MarketProduct,
    providerOverride?: string | null,
    options?: { exchange?: string },
  ): Promise<MarketQuote | null> {
    const provider = this.getProviderForProduct(product, providerOverride);
    return provider.getLatestPrice(symbolCode, product, options);
  }

  /**
   * Resuelve proveedor segun tipo de producto.
   */
  private getProviderForProduct(
    product: MarketProduct,
    providerOverride?: string | null,
  ): MarketDataProvider {
    const providerKey =
      providerOverride ||
      this.config.get<string>(`market_data.providerByProduct.${product}`) ||
      this.config.get<string>('market_data.provider') ||
      '';

    const provider = this.providers.find((item) => item.providerKey === providerKey);
    if (!provider) {
      throw new NotFoundException(
        `Market provider not found for product ${product}: ${providerKey}`,
      );
    }
    return provider;
  }
}
