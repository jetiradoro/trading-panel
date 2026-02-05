import {
  Injectable,
  NotImplementedException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MarketDataProvider,
  MarketProduct,
  MarketQuote,
} from './market-data.provider';
import * as dayjs from 'dayjs';
import axios from 'axios';
import { mapMarketDataError } from '../utils/market-data-errors';

/**
 * Proveedor EODHD para obtener precios de mercado.
 */
@Injectable()
export class EodhdMarketDataProvider implements MarketDataProvider {
  providerKey = 'eodhd';
  private readonly baseUrl: string;
  private readonly apiToken: string;
  private readonly stockEndpoint: string;
  private readonly etfEndpoint: string;
  private readonly cryptoEndpoint: string;
  private readonly maxRetries = 3;

  /**
   * Configura credenciales y endpoints desde ConfigService.
   */
  constructor(private readonly config: ConfigService) {
    this.baseUrl = this.config.get<string>('market_data.eodhd.baseUrl') || '';
    this.apiToken = this.config.get<string>('market_data.eodhd.apiToken') || '';
    this.stockEndpoint =
      this.config.get<string>('market_data.eodhd.stockEndpoint') || '';
    this.etfEndpoint =
      this.config.get<string>('market_data.eodhd.etfEndpoint') || '';
    this.cryptoEndpoint =
      this.config.get<string>('market_data.eodhd.cryptoEndpoint') || '';
  }

  /**
   * Obtiene el ultimo precio del simbolo en EODHD segun su producto.
   */
  async getLatestPrice(
    symbolCode: string,
    product: MarketProduct,
    options?: { exchange?: string },
  ): Promise<MarketQuote | null> {
    return this.executeWithRetry<MarketQuote | null>(async () => {
      switch (product) {
        case 'crypto':
          return this.getLatestCryptoPrice(symbolCode);
        case 'etf':
          return this.getLatestEtfPrice(symbolCode, options?.exchange);
        case 'derivative':
          return this.getLatestStockPrice(symbolCode, options?.exchange);
        default:
          return this.getLatestStockPrice(symbolCode, options?.exchange);
      }
    });
  }

  /**
   * Obtiene el ultimo precio de un simbolo de acciones.
   */
  private async getLatestStockPrice(
    symbolCode: string,
    exchange?: string,
  ): Promise<MarketQuote | null> {
    if (!this.baseUrl || !this.apiToken || !this.stockEndpoint) {
      throw new BadRequestException('EODHD config incompleta para stock');
    }

    const endpoint = this.buildEndpoint('stock');
    const url = new URL(this.buildUrl(endpoint, symbolCode));
    url.searchParams.set('api_token', this.apiToken);
    url.searchParams.set('fmt', 'json');
    if (exchange) {
      url.searchParams.set('exchange', exchange);
    }

    let data: any;
    try {
      const response = await axios.get(url.toString());
      data = response.data;
    } catch (error) {
      mapMarketDataError(error, symbolCode);
    }
    if (!Array.isArray(data) || data.length === 0) {
      return null;
    }

    const lastItem = data[data.length - 1];
    if (
      !lastItem?.previousCloseDate ||
      lastItem?.previousClose === undefined ||
      lastItem?.previousClose === null
    ) {
      return null;
    }

    return {
      price: Number(lastItem.previousClose),
      date: this.buildCloseDate(lastItem.previousCloseDate),
      raw: lastItem,
    };
  }

  /**
   * Obtiene el ultimo precio de un simbolo ETF.
   */
  private async getLatestEtfPrice(
    symbolCode: string,
    exchange?: string,
  ): Promise<MarketQuote | null> {
    if (!this.baseUrl || !this.apiToken || !this.etfEndpoint) {
      throw new BadRequestException('EODHD config incompleta para etf');
    }

    const endpoint = this.buildEndpoint('etf');
    const url = new URL(this.buildUrl(endpoint, symbolCode));
    url.searchParams.set('api_token', this.apiToken);
    url.searchParams.set('fmt', 'json');
    url.searchParams.set('type', 'etf');
    if (exchange) {
      url.searchParams.set('exchange', exchange);
    }

    let data: any;
    try {
      const response = await axios.get(url.toString());
      // console.log(response.data);
      data = response.data;
    } catch (error) {
      console.log(error);
      mapMarketDataError(error, symbolCode);
    }

    if (!Array.isArray(data) || data.length === 0) {
      return null;
    }

    const lastItem = data[data.length - 1];
    if (
      !lastItem?.previousCloseDate ||
      lastItem?.previousClose === undefined ||
      lastItem?.previousClose === null
    ) {
      return null;
    }

    return {
      price: Number(lastItem.previousClose),
      date: this.buildCloseDate(lastItem.previousCloseDate),
      raw: lastItem,
    };
  }

  /**
   * Obtiene el ultimo precio de un simbolo crypto.
   */
  private async getLatestCryptoPrice(
    symbolCode: string,
    exchange?: string,
  ): Promise<MarketQuote | null> {
    if (!this.baseUrl || !this.apiToken || !this.cryptoEndpoint) {
      throw new BadRequestException('EODHD config incompleta para crypto');
    }

    const endpoint = this.buildEndpoint('crypto');
    const url = new URL(this.buildUrl(endpoint, symbolCode));
    url.searchParams.set('api_token', this.apiToken);
    url.searchParams.set('fmt', 'json');
    url.searchParams.set('type', 'crypto');
    if (exchange) {
      url.searchParams.set('exchange', exchange);
    }

    let data: any;
    try {
      const response = await axios.get(url.toString());
      // console.log(response.data);
      data = response.data;
    } catch (error) {
      console.log(error);
      mapMarketDataError(error, symbolCode);
    }

    if (!Array.isArray(data) || data.length === 0) {
      return null;
    }

    const lastItem = data[data.length - 1];
    if (
      !lastItem?.previousCloseDate ||
      lastItem?.previousClose === undefined ||
      lastItem?.previousClose === null
    ) {
      return null;
    }

    return {
      price: Number(lastItem.previousClose),
      date: this.buildCryptoCloseDate(lastItem.previousCloseDate),
      raw: lastItem,
    };
  }

  /**
   * Resuelve endpoint segun tipo de producto.
   */
  private buildEndpoint(product: MarketProduct): string {
    switch (product) {
      case 'crypto':
        return this.cryptoEndpoint;
      case 'etf':
        return this.etfEndpoint;
      case 'derivative':
        return this.stockEndpoint;
      default:
        return this.stockEndpoint;
    }
  }

  /**
   * Construye URL final incorporando simbolo.
   * Si el endpoint incluye {symbol} lo reemplaza, si no lo agrega al final.
   */
  private buildUrl(endpoint: string, symbolCode: string): string {
    const normalizedBase = this.baseUrl.endsWith('/')
      ? this.baseUrl.slice(0, -1)
      : this.baseUrl;
    const normalizedEndpoint = endpoint.startsWith('/')
      ? endpoint
      : `/${endpoint}`;
    const endpointWithSymbol = normalizedEndpoint.includes('{symbol}')
      ? normalizedEndpoint.replace('{symbol}', symbolCode)
      : `${normalizedEndpoint}${normalizedEndpoint.endsWith('/') ? '' : '/'}${symbolCode}`;
    return `${normalizedBase}${endpointWithSymbol}`;
  }

  /**
   * Establece la hora de cierre a las 23:00:00 en una fecha base.
   */
  private buildCloseDate(dateValue: string): Date {
    return dayjs(dateValue)
      .hour(23)
      .minute(0)
      .second(0)
      .millisecond(0)
      .toDate();
  }

  /**
   * Crypto: fija la hora a las 23:00 del día anterior a la fecha base.
   */
  private buildCryptoCloseDate(dateValue: string): Date {
    return dayjs(dateValue)
      .subtract(1, 'day')
      .hour(23)
      .minute(0)
      .second(0)
      .millisecond(0)
      .toDate();
  }

  /**
   * Ejecuta una accion con reintentos (max 3).
   */
  private async executeWithRetry<T>(action: () => Promise<T>): Promise<T> {
    let lastError: unknown;
    for (let attempt = 1; attempt <= this.maxRetries; attempt += 1) {
      try {
        return await action();
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError;
  }
}
