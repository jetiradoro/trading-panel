import { defineStore } from 'pinia';
import { api } from 'boot/axios';

/**
 * Interfaz para una entrada en una operación
 */
interface OperationEntry {
  id: string;
  operationId: string;
  entryType: string; // 'buy' | 'sell'
  quantity: number;
  price: number;
  tax: number;
  date: string;
  createdAt: string;
}

/**
 * Interfaz para el historial de precios
 */
interface PriceHistory {
  id: string;
  symbolId?: string;
  price: number;
  date: string;
  createdAt: string;
}

/**
 * Interfaz para métricas calculadas de una operación
 */
interface OperationMetrics {
  currentQty: number;
  avgBuyPrice: number;
  unrealizedPnL: number | null;
  pnlPercentage: number | null;
  currentInvestment: number | null;
  buyQty: number;
  sellQty: number;
}

/**
 * Interfaz para una operación
 */
interface Operation {
  id: string;
  accountId: string;
  userId: string;
  symbolId: string;
  product: string; // 'crypto' | 'stock' | 'etf'
  type: string; // 'long' | 'short'
  status: string; // 'open' | 'closed'
  balance?: number;
  totalFees?: number;
  createdAt: string;
  updatedAt: string;
  symbol?: {
    id: string;
    code: string;
    name: string;
    logo?: string;
    priceHistory?: PriceHistory[];
  };
  entries?: OperationEntry[];
  // Métricas calculadas (solo para operaciones abiertas)
  metrics?: OperationMetrics;
}

/**
 * DTO para crear una nueva operación
 */
interface NewOperationDto {
  accountId: string;
  symbolId: string;
  product: string;
  type: string;
  firstEntry?: {
    entryType: string;
    quantity: number;
    price: number;
    tax?: number;
    date: string;
  };
}

/**
 * DTO para añadir una entrada
 */
interface NewEntryDto {
  entryType: string;
  quantity: number;
  price: number;
  tax?: number;
  date: string;
}

/**
 * DTO para actualizar una entrada
 */
interface UpdateEntryDto {
  entryType?: string;
  quantity?: number;
  price?: number;
  tax?: number;
  date?: string;
}

interface OperationsState {
  operations: Operation[];
  currentOperation: Operation | null;
  loading: boolean;
  error: string | null;
}

export const useOperationsStore = defineStore('operations', {
  state: (): OperationsState => ({
    operations: [],
    currentOperation: null,
    loading: false,
    error: null,
  }),

  actions: {
    /**
     * Obtener todas las operaciones con filtros opcionales
     */
    async fetchOperations(filters?: { status?: string; product?: string; symbolId?: string }) {
      try {
        this.loading = true;
        this.error = null;
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.product) params.append('product', filters.product);
        if (filters?.symbolId) params.append('symbolId', filters.symbolId);

        const { data } = await api.get(`/operations?${params.toString()}`);
        this.operations = data;
      } catch (error) {
        console.error('Error fetching operations:', error);
        this.error = 'Error al cargar operaciones';
      } finally {
        this.loading = false;
      }
    },

    /**
     * Obtener detalle completo de una operación
     */
    async fetchOperationDetail(operationId: string) {
      try {
        this.loading = true;
        this.error = null;
        const { data } = await api.get(`/operations/${operationId}`);
        this.currentOperation = data;
        return data;
      } catch (error) {
        console.error('Error fetching operation detail:', error);
        this.error = 'Error al cargar detalle de operación';
      } finally {
        this.loading = false;
      }
    },

    /**
     * Crear una nueva operación
     */
    async createOperation(payload: NewOperationDto) {
      try {
        this.loading = true;
        this.error = null;
        const { data } = await api.post('/operations', payload);
        this.operations.unshift(data);
        return data;
      } catch (error) {
        console.error('Error creating operation:', error);
        this.error = 'Error al crear operación';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Eliminar una operación
     */
    async deleteOperation(operationId: string) {
      try {
        this.loading = true;
        this.error = null;
        await api.delete(`/operations/${operationId}`);
        this.operations = this.operations.filter((op) => op.id !== operationId);
        if (this.currentOperation?.id === operationId) {
          this.currentOperation = null;
        }
      } catch (error) {
        console.error('Error deleting operation:', error);
        this.error = 'Error al eliminar operación';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Añadir una entrada a una operación existente
     */
    async addEntry(operationId: string, payload: NewEntryDto) {
      try {
        this.loading = true;
        this.error = null;
        const { data } = await api.post(`/operations/${operationId}/entries`, payload);
        // Actualizar la operación actual si está cargada
        if (this.currentOperation?.id === operationId) {
          await this.fetchOperationDetail(operationId);
        }
        return data;
      } catch (error) {
        console.error('Error adding entry:', error);
        this.error = 'Error al añadir entrada';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Actualizar una entrada
     */
    async updateEntry(operationId: string, entryId: string, payload: UpdateEntryDto) {
      try {
        this.loading = true;
        this.error = null;
        const { data } = await api.put(`/operations/${operationId}/entries/${entryId}`, payload);
        // Actualizar la operación actual
        if (this.currentOperation?.id === operationId) {
          await this.fetchOperationDetail(operationId);
        }
        return data;
      } catch (error) {
        console.error('Error updating entry:', error);
        this.error = 'Error al actualizar entrada';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Eliminar una entrada
     */
    async deleteEntry(operationId: string, entryId: string) {
      try {
        this.loading = true;
        this.error = null;
        await api.delete(`/operations/${operationId}/entries/${entryId}`);
        // Actualizar la operación actual
        if (this.currentOperation?.id === operationId) {
          await this.fetchOperationDetail(operationId);
        }
      } catch (error) {
        console.error('Error deleting entry:', error);
        this.error = 'Error al eliminar entrada';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Abrir o cerrar una operación de forma manual
     */
    async updateOperationStatus(operationId: string, status: 'open' | 'closed') {
      try {
        this.loading = true;
        this.error = null;
        const { data } = await api.patch(`/operations/${operationId}/status`, { status });
        const index = this.operations.findIndex((op) => op.id === operationId);
        if (index !== -1) {
          this.operations[index] = { ...this.operations[index], ...data };
        }
        if (this.currentOperation?.id === operationId) {
          this.currentOperation = data;
        }
        return data;
      } catch (error) {
        console.error('Error updating operation status:', error);
        this.error = 'Error al actualizar estado de operación';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Limpiar operación actual
     */
    clearCurrentOperation() {
      this.currentOperation = null;
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
     * Operaciones abiertas
     */
    openOperations: (state): Operation[] => {
      return state.operations.filter((op) => op.status === 'open');
    },

    /**
     * Operaciones cerradas
     */
    closedOperations: (state): Operation[] => {
      return state.operations.filter((op) => op.status === 'closed');
    },

    /**
     * Balance total (cerradas + abiertas)
     */
    totalBalance: (state): number => {
      return state.operations.reduce((acc, op) => {
        if (op.status === 'closed') {
          return acc + (op.balance ?? 0);
        }
        if (op.status === 'open') {
          return acc + (op.metrics?.unrealizedPnL ?? 0);
        }
        return acc;
      }, 0);
    },

    /**
     * Agrupar operaciones por símbolo
     */
    operationsBySymbol: (state) => {
      const grouped = {} as Record<string, Operation[]>;
      state.operations.forEach((op) => {
        const symbolId = op.symbolId;
        if (!grouped[symbolId]) {
          grouped[symbolId] = [];
        }
        grouped[symbolId].push(op);
      });
      return grouped;
    },
  },
});
