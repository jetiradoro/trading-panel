/**
 * Tipos de producto soportados para datos de mercado.
 */
export type MarketProduct = 'stock' | 'crypto' | 'etf' | 'derivative';

/**
 * Resultado estandar de un precio de mercado.
 */
export interface MarketQuote {
  price: number;
  date: Date;
  currency?: string;
  raw?: unknown;
}

/**
 * Contrato base para proveedores de datos de mercado.
 */
export interface MarketDataProvider {
  /**
   * Identificador unico del proveedor (ej: eodhd).
   */
  providerKey: string;

  /**
   * Obtiene el ultimo precio del simbolo indicado.
   */
  getLatestPrice(
    symbolCode: string,
    product: MarketProduct,
    options?: { exchange?: string },
  ): Promise<MarketQuote | null>;
}
