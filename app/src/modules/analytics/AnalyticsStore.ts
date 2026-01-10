import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from 'src/boot/axios';
import { Notify } from 'quasar';
import type {
  AccountBalanceDto,
  PerformanceDto,
  SymbolPerformanceDto,
  ProductDistributionDto,
  PortfolioPointDto,
  PeriodType,
} from './types';

/**
 * Store de analítica para gestionar el estado del dashboard
 * Centraliza el periodo seleccionado y los datos cargados
 */
export const useAnalyticsStore = defineStore('analytics', () => {
  // Estado
  const period = ref<PeriodType>('30d');
  const accountBalance = ref<AccountBalanceDto | null>(null);
  const performance = ref<PerformanceDto | null>(null);
  const symbolsRanking = ref<SymbolPerformanceDto[]>([]);
  const productDistribution = ref<ProductDistributionDto[]>([]);
  const portfolioEvolution = ref<PortfolioPointDto[]>([]);

  const loadingBalance = ref(false);
  const loadingPerformance = ref(false);
  const loadingRanking = ref(false);
  const loadingCharts = ref(false);
  const error = ref<string | null>(null);

  /**
   * Carga el balance de cuenta
   */
  async function loadAccountBalance() {
    try {
      loadingBalance.value = true;
      error.value = null;
      const { data } = await api.get<AccountBalanceDto>('/analytics/account-balance');
      accountBalance.value = data;
    } catch (err) {
      console.error('Error al cargar balance de cuenta:', err);
      error.value = 'Error al cargar el balance de cuenta';
      Notify.create({
        type: 'negative',
        message: 'Error al cargar el balance de cuenta',
        position: 'top',
      });
    } finally {
      loadingBalance.value = false;
    }
  }

  /**
   * Carga las métricas de rendimiento
   */
  async function loadPerformance() {
    try {
      loadingPerformance.value = true;
      error.value = null;
      const { data } = await api.get<PerformanceDto>('/analytics/performance', {
        params: { period: period.value },
      });
      performance.value = data;
    } catch (err) {
      console.error('Error al cargar rendimiento:', err);
      error.value = 'Error al cargar métricas de rendimiento';
      Notify.create({
        type: 'negative',
        message: 'Error al cargar métricas de rendimiento',
        position: 'top',
      });
    } finally {
      loadingPerformance.value = false;
    }
  }

  /**
   * Carga el ranking de símbolos
   */
  async function loadSymbolsRanking() {
    try {
      loadingRanking.value = true;
      error.value = null;
      const { data } = await api.get<SymbolPerformanceDto[]>('/analytics/symbols-ranking', {
        params: { period: period.value },
      });
      symbolsRanking.value = data;
    } catch (err) {
      console.error('Error al cargar ranking de símbolos:', err);
      error.value = 'Error al cargar ranking de símbolos';
      Notify.create({
        type: 'negative',
        message: 'Error al cargar ranking de símbolos',
        position: 'top',
      });
    } finally {
      loadingRanking.value = false;
    }
  }

  /**
   * Carga la distribución por producto
   */
  async function loadProductDistribution() {
    try {
      loadingCharts.value = true;
      error.value = null;
      const { data } = await api.get<ProductDistributionDto[]>('/analytics/product-distribution');
      productDistribution.value = data;
    } catch (err) {
      console.error('Error al cargar distribución de productos:', err);
      error.value = 'Error al cargar distribución de productos';
      Notify.create({
        type: 'negative',
        message: 'Error al cargar distribución de productos',
        position: 'top',
      });
    } finally {
      loadingCharts.value = false;
    }
  }

  /**
   * Carga la evolución del portfolio
   */
  async function loadPortfolioEvolution() {
    try {
      loadingCharts.value = true;
      error.value = null;
      const { data } = await api.get<PortfolioPointDto[]>('/analytics/portfolio-evolution', {
        params: { period: period.value },
      });
      portfolioEvolution.value = data;
    } catch (err) {
      console.error('Error al cargar evolución del portfolio:', err);
      error.value = 'Error al cargar evolución del portfolio';
      Notify.create({
        type: 'negative',
        message: 'Error al cargar evolución del portfolio',
        position: 'top',
      });
    } finally {
      loadingCharts.value = false;
    }
  }

  /**
   * Carga todos los datos del dashboard
   */
  async function loadDashboard() {
    await Promise.all([
      loadAccountBalance(),
      loadPerformance(),
      loadSymbolsRanking(),
      loadProductDistribution(),
      loadPortfolioEvolution(),
    ]);
  }

  /**
   * Recarga los datos que dependen del periodo
   */
  async function reloadPeriodData() {
    await Promise.all([
      loadPerformance(),
      loadSymbolsRanking(),
      loadPortfolioEvolution(),
    ]);
  }

  /**
   * Cambia el periodo seleccionado y recarga datos
   */
  async function changePeriod(newPeriod: PeriodType) {
    period.value = newPeriod;
    await reloadPeriodData();
  }

  return {
    // Estado
    period,
    accountBalance,
    performance,
    symbolsRanking,
    productDistribution,
    portfolioEvolution,
    loadingBalance,
    loadingPerformance,
    loadingRanking,
    loadingCharts,
    error,

    // Acciones
    loadDashboard,
    changePeriod,
  };
});
