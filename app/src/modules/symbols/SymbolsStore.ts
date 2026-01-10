import { defineStore } from 'pinia';
import { api } from 'boot/axios';

/**
 * Interfaz para el historial de precios
 */
interface PriceHistory {
  id: string;
  symbolId: string;
  price: number;
  date: string;
  createdAt: string;
}

/**
 * Interfaz para un símbolo de trading
 */
interface Symbol {
  id: string;
  code: string;
  name: string;
  logo?: string;
  product: string; // 'crypto' | 'stock' | 'etf'
  createdAt: string;
  updatedAt: string;
  priceHistory?: PriceHistory[];
}

/**
 * DTO para crear un nuevo símbolo
 */
interface NewSymbolDto {
  code: string;
  name: string;
  logo?: string;
  product: string;
}

/**
 * DTO para actualizar un símbolo
 */
interface UpdateSymbolDto {
  code?: string;
  name?: string;
  logo?: string;
  product?: string;
}

/**
 * DTO para crear precio en historial
 */
interface NewPriceHistoryDto {
  price: number;
  date: string;
}

/**
 * DTO para actualizar precio en historial
 */
interface UpdatePriceHistoryDto {
  price?: number;
  date?: string;
}

interface SymbolsState {
  symbols: Symbol[];
  currentSymbol: Symbol | null;
  loading: boolean;
  error: string | null;
}

export const useSymbolsStore = defineStore('symbols', {
  state: (): SymbolsState => ({
    symbols: [],
    currentSymbol: null,
    loading: false,
    error: null,
  }),

  actions: {
    /**
     * Obtener todos los símbolos
     */
    async fetchSymbols() {
      try {
        this.loading = true;
        this.error = null;
        const { data } = await api.get('/symbols');
        this.symbols = data;
      } catch (error) {
        console.error('Error fetching symbols:', error);
        this.error = 'Error al cargar símbolos';
      } finally {
        this.loading = false;
      }
    },

    /**
     * Buscar símbolos por query
     */
    async searchSymbols(query: string) {
      try {
        this.loading = true;
        this.error = null;
        const { data } = await api.get(`/symbols/search?q=${query}`);
        return data;
      } catch (error) {
        console.error('Error searching symbols:', error);
        this.error = 'Error al buscar símbolos';
        return [];
      } finally {
        this.loading = false;
      }
    },

    /**
     * Obtener un símbolo por ID
     */
    async fetchSymbol(symbolId: string) {
      try {
        this.loading = true;
        this.error = null;
        const { data } = await api.get(`/symbols/${symbolId}`);
        this.currentSymbol = data;
        return data;
      } catch (error) {
        console.error('Error fetching symbol:', error);
        this.error = 'Error al cargar símbolo';
      } finally {
        this.loading = false;
      }
    },

    /**
     * Crear un nuevo símbolo
     */
    async createSymbol(payload: NewSymbolDto) {
      try {
        this.loading = true;
        this.error = null;
        const { data } = await api.post('/symbols', payload);
        this.symbols.unshift(data);
        return data;
      } catch (error) {
        console.error('Error creating symbol:', error);
        this.error = 'Error al crear símbolo';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Actualizar un símbolo existente
     */
    async updateSymbol(symbolId: string, payload: UpdateSymbolDto) {
      try {
        this.loading = true;
        this.error = null;
        const { data } = await api.put(`/symbols/${symbolId}`, payload);
        const index = this.symbols.findIndex((s) => s.id === symbolId);
        if (index !== -1) {
          this.symbols[index] = data;
        }
        if (this.currentSymbol?.id === symbolId) {
          this.currentSymbol = data;
        }
        return data;
      } catch (error) {
        console.error('Error updating symbol:', error);
        this.error = 'Error al actualizar símbolo';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Eliminar un símbolo
     */
    async deleteSymbol(symbolId: string) {
      try {
        this.loading = true;
        this.error = null;
        await api.delete(`/symbols/${symbolId}`);
        this.symbols = this.symbols.filter((s) => s.id !== symbolId);
        if (this.currentSymbol?.id === symbolId) {
          this.currentSymbol = null;
        }
      } catch (error) {
        console.error('Error deleting symbol:', error);
        this.error = 'Error al eliminar símbolo';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Obtener historial de precios de un símbolo
     */
    async fetchPriceHistory(symbolId: string) {
      try {
        this.loading = true;
        this.error = null;
        const { data } = await api.get(`/symbols/${symbolId}/prices`);
        if (this.currentSymbol?.id === symbolId) {
          this.currentSymbol.priceHistory = data;
        }
        return data;
      } catch (error) {
        console.error('Error fetching price history:', error);
        this.error = 'Error al cargar historial de precios';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Agregar precio al historial
     */
    async addPriceHistory(symbolId: string, payload: NewPriceHistoryDto) {
      try {
        this.loading = true;
        this.error = null;
        const { data } = await api.post(`/symbols/${symbolId}/prices`, payload);
        if (this.currentSymbol?.id === symbolId) {
          await this.fetchPriceHistory(symbolId);
        }
        return data;
      } catch (error) {
        console.error('Error adding price:', error);
        this.error = 'Error al agregar precio';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Actualizar precio del historial
     */
    async updatePriceHistory(
      symbolId: string,
      priceId: string,
      payload: UpdatePriceHistoryDto
    ) {
      try {
        this.loading = true;
        this.error = null;
        const { data } = await api.put(
          `/symbols/${symbolId}/prices/${priceId}`,
          payload
        );
        if (this.currentSymbol?.id === symbolId) {
          await this.fetchPriceHistory(symbolId);
        }
        return data;
      } catch (error) {
        console.error('Error updating price:', error);
        this.error = 'Error al actualizar precio';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Eliminar precio del historial
     */
    async deletePriceHistory(symbolId: string, priceId: string) {
      try {
        this.loading = true;
        this.error = null;
        await api.delete(`/symbols/${symbolId}/prices/${priceId}`);
        if (this.currentSymbol?.id === symbolId) {
          await this.fetchPriceHistory(symbolId);
        }
      } catch (error) {
        console.error('Error deleting price:', error);
        this.error = 'Error al eliminar precio';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Limpiar símbolo actual
     */
    clearCurrentSymbol() {
      this.currentSymbol = null;
    },

    /**
     * Limpiar error
     */
    clearError() {
      this.error = null;
    },
  },

  getters: {
    /**
     * Símbolos de criptomonedas
     */
    cryptoSymbols: (state): Symbol[] => {
      return state.symbols.filter((s) => s.product === 'crypto');
    },

    /**
     * Símbolos de acciones
     */
    stockSymbols: (state): Symbol[] => {
      return state.symbols.filter((s) => s.product === 'stock');
    },

    /**
     * Símbolos de ETFs
     */
    etfSymbols: (state): Symbol[] => {
      return state.symbols.filter((s) => s.product === 'etf');
    },

    /**
     * Agrupar símbolos por tipo de producto
     */
    symbolsByProduct: (state) => {
      const grouped = {} as Record<string, Symbol[]>;
      state.symbols.forEach((symbol) => {
        const product = symbol.product;
        if (!grouped[product]) {
          grouped[product] = [];
        }
        grouped[product].push(symbol);
      });
      return grouped;
    },

    /**
     * Obtener símbolo por código
     */
    getSymbolByCode: (state) => (code: string): Symbol | undefined => {
      return state.symbols.find((s) => s.code === code);
    },
  },
});
