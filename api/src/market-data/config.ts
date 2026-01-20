const marketDataConfig = () => ({
  market_data: {
    provider: process.env.MARKET_DATA_PROVIDER || 'eodhd',
    providerByProduct: {
      stock: process.env.MARKET_DATA_PROVIDER_STOCK || 'eodhd',
      etf: process.env.MARKET_DATA_PROVIDER_ETF || 'eodhd',
      crypto: process.env.MARKET_DATA_PROVIDER_CRYPTO || 'eodhd',
    },
    providers: [{ code: 'eodhd', label: 'EODHD' }],
    eodhd: {
      baseUrl: process.env.EODHD_BASE_URL,
      apiToken: process.env.EODHD_API_TOKEN,
      stockEndpoint: process.env.EODHD_STOCK_ENDPOINT,
      etfEndpoint: process.env.EODHD_ETF_ENDPOINT,
      cryptoEndpoint: process.env.EODHD_CRYPTO_ENDPOINT,
    },
  },
});

export default marketDataConfig;
