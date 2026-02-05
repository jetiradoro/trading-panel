export const config = {
  apiUrl: import.meta.env.VITE_API_URL,
  version: process.env.APP_VERSION,
  app_name: 'Trading Panel',
  home_page: 'dashboard', // 'transactions','panel'
};

/**
 * Diccionarios para el módulo de operaciones
 */
export const products = [
  { code: 'crypto', label: 'Cripto' },
  { code: 'stock', label: 'Acción' },
  { code: 'etf', label: 'ETF' },
  { code: 'derivative', label: 'Derivado' },
];

export const operationTypes = [
  { code: 'long', label: 'Long (Compra)' },
  { code: 'short', label: 'Short (Venta)' },
];

export const entryTypes = [
  { code: 'buy', label: 'Compra' },
  { code: 'sell', label: 'Venta' },
];

export const operationStatus = [
  { code: 'open', label: 'Abierta', color: 'open' },
  { code: 'closed', label: 'Cerrada', color: 'red-5' },
];
