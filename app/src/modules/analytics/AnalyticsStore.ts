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
  MonthlyPerformanceDto,
  EquityPointDto,
  RiskMetricsDto,
  PeriodType,
  ProductScope,
} from './types';

/**
 * Store de analítica para gestionar el estado del dashboard
 * Centraliza el periodo seleccionado y los datos cargados
 */
export const useAnalyticsStore = defineStore('analytics', () => {
  // Estado
  const period = ref<PeriodType>('30d');
  const productScope = ref<ProductScope>('trading');
  const portfolioRange = ref<'7d' | '1m' | '3m' | '6m' | '1y' | 'all'>('3m');
  const accountBalance = ref<AccountBalanceDto | null>(null);
  const performance = ref<PerformanceDto | null>(null);
  const symbolsRanking = ref<SymbolPerformanceDto[]>([]);
  const productDistribution = ref<ProductDistributionDto[]>([]);
  const portfolioEvolution = ref<PortfolioPointDto[]>([]);
  const monthlyPerformance = ref<MonthlyPerformanceDto[]>([]);
  const equityCurve = ref<EquityPointDto[]>([]);
  const riskMetrics = ref<RiskMetricsDto | undefined>(undefined);

  const loadingBalance = ref(false);
  const loadingPerformance = ref(false);
  const loadingRanking = ref(false);
  const loadingCharts = ref(false);
  const loadingAdvanced = ref(false);
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
        params: { period: period.value, product: productScope.value },
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
        params: { period: period.value, product: productScope.value },
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
  async function loadPortfolioEvolution(range?: string) {
    try {
      loadingCharts.value = true;
      error.value = null;
      const { data } = await api.get<PortfolioPointDto[]>('/analytics/portfolio-evolution', {
        params: { period: range || portfolioRange.value, product: productScope.value },
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
   * Carga el rendimiento mensual
   */
  async function loadMonthlyPerformance() {
    try {
      loadingAdvanced.value = true;
      error.value = null;
      const { data } = await api.get<MonthlyPerformanceDto[]>('/analytics/monthly-performance', {
        params: { period: period.value, product: productScope.value },
      });
      monthlyPerformance.value = data;
    } catch (err) {
      console.error('Error al cargar rendimiento mensual:', err);
      error.value = 'Error al cargar rendimiento mensual';
      Notify.create({
        type: 'negative',
        message: 'Error al cargar rendimiento mensual',
        position: 'top',
      });
    } finally {
      loadingAdvanced.value = false;
    }
  }

  /**
   * Carga la curva de equity
   */
  async function loadEquityCurve() {
    try {
      loadingAdvanced.value = true;
      error.value = null;
      const { data } = await api.get<EquityPointDto[]>('/analytics/equity-curve', {
        params: { period: period.value, product: productScope.value },
      });
      equityCurve.value = data;
    } catch (err) {
      console.error('Error al cargar curva de equity:', err);
      error.value = 'Error al cargar curva de equity';
      Notify.create({
        type: 'negative',
        message: 'Error al cargar curva de equity',
        position: 'top',
      });
    } finally {
      loadingAdvanced.value = false;
    }
  }

  /**
   * Carga las métricas de riesgo
   */
  async function loadRiskMetrics() {
    try {
      loadingAdvanced.value = true;
      error.value = null;
      const { data } = await api.get<RiskMetricsDto>('/analytics/risk-metrics', {
        params: { period: period.value, product: productScope.value },
      });
      riskMetrics.value = data;
    } catch (err) {
      console.error('Error al cargar métricas de riesgo:', err);
      error.value = 'Error al cargar métricas de riesgo';
      Notify.create({
        type: 'negative',
        message: 'Error al cargar métricas de riesgo',
        position: 'top',
      });
    } finally {
      loadingAdvanced.value = false;
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
      loadMonthlyPerformance(),
      loadEquityCurve(),
      loadRiskMetrics(),
    ]);
  }

  /**
   * Recarga los datos que dependen del periodo
   */
  async function reloadPeriodData() {
    await Promise.all([
      loadPerformance(),
      loadSymbolsRanking(),
      loadMonthlyPerformance(),
      loadEquityCurve(),
      loadRiskMetrics(),
    ]);
  }

  /**
   * Cambia el periodo seleccionado y recarga datos
   */
  async function changePeriod(newPeriod: PeriodType) {
    period.value = newPeriod;
    await reloadPeriodData();
  }

  /**
   * Cambia el alcance de producto y recarga datos
   */
  async function changeProductScope(newScope: ProductScope) {
    productScope.value = newScope;
    await loadDashboard();
    await loadPortfolioEvolution(portfolioRange.value);
  }

  /**
   * Cambia el rango del portfolio y recarga datos
   */
  async function setPortfolioRange(newRange: typeof portfolioRange.value) {
    portfolioRange.value = newRange;
    await loadPortfolioEvolution(newRange);
  }

  return {
    // Estado
    period,
    productScope,
    portfolioRange,
    accountBalance,
    performance,
    symbolsRanking,
    productDistribution,
    portfolioEvolution,
    monthlyPerformance,
    equityCurve,
    riskMetrics,
    loadingBalance,
    loadingPerformance,
    loadingRanking,
    loadingCharts,
    loadingAdvanced,
    error,

    // Acciones
    loadDashboard,
    changePeriod,
    changeProductScope,
    setPortfolioRange,
  };
});
