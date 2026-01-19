<template>
  <q-page padding>
    <div class="row items-center justify-between q-mb-md q-gutter-sm">
      <h5 class="q-my-none col-auto">Dashboard de Analítica</h5>
      <period-filter v-model="store.period" @update:model-value="onPeriodChange" class="col-auto" />
    </div>

    <q-tabs
      v-model="store.productScope"
      dense
      class="q-mb-lg"
      active-color="primary"
      indicator-color="primary"
      @update:model-value="onProductChange"
    >
      <q-tab name="trading" icon="show_chart" label="Trading" />
      <q-tab name="etf" icon="savings" label="Planes ETF" />
    </q-tabs>

    <!-- Balance de cuenta -->
    <account-balance-cards
      v-if="accountBalance"
      :balance="accountBalance"
      class="q-mb-lg"
    />

    <open-investment-summary
      v-if="accountBalance"
      :balance="accountBalance"
      class="q-mb-lg"
    />

    <!-- Skeletons mientras carga -->
    <div v-else class="row q-col-gutter-md q-mb-lg">
      <div v-for="i in 3" :key="i" class="col-12 col-sm-4">
        <q-card flat bordered>
          <q-card-section>
            <q-skeleton type="text" width="60%" />
            <q-skeleton type="text" class="text-h5 q-mt-sm" />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Rendimiento global y Distribución por producto -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-md-4">
        <performance-summary
          v-if="performance"
          :performance="performance"
          :scope-label="scopeLabel"
          :period-label="periodLabel"
        />

        <!-- Skeleton mientras carga -->
        <q-card v-else flat bordered>
          <q-card-section>
            <q-skeleton type="text" class="text-h6" width="50%" />
            <q-skeleton type="text" class="text-h4 q-mt-md" />
            <q-skeleton type="rect" height="100px" class="q-mt-md" />
          </q-card-section>
        </q-card>
      </div>

      <!-- Distribución por producto -->
      <div class="col-12 col-md-8">
        <product-distribution-chart
          :data="productDistribution || []"
          :loading="loadingCharts"
        />
      </div>
    </div>

    <!-- Evolución del portfolio -->
    <div class="q-mb-lg">
      <portfolio-evolution-chart
        :data="portfolioEvolution || []"
        :loading="loadingCharts"
        :scope-label="scopeLabel"
        @range-change="onPortfolioRangeChange"
      />
    </div>

    <!-- Métricas de riesgo -->
    <div class="q-mb-lg">
      <risk-metrics-cards
        :data="riskMetrics"
        :loading="loadingAdvanced"
        :scope-label="scopeLabel"
        :period-label="periodLabel"
      />
    </div>

    <!-- Gráficos avanzados -->
    <div class="row q-col-gutter-md q-mb-lg">
      <!-- Rendimiento mensual -->
      <div class="col-12 col-md-6">
        <monthly-performance-chart
          :data="monthlyPerformance || []"
          :loading="loadingAdvanced"
          :scope-label="scopeLabel"
          :period-label="periodLabel"
        />
      </div>

      <!-- Curva de equity -->
      <div class="col-12 col-md-6">
        <equity-curve-chart
          :data="equityCurve || []"
          :loading="loadingAdvanced"
          :scope-label="scopeLabel"
          :period-label="periodLabel"
        />
      </div>
    </div>

    <!-- Ranking de símbolos -->
    <symbol-ranking-table
      v-if="symbolsRanking && symbolsRanking.length > 0"
      :symbols="symbolsRanking"
      :scope-label="scopeLabel"
      :period-label="periodLabel"
    />

    <!-- Skeleton mientras carga -->
    <q-card v-else flat bordered>
      <q-card-section>
        <q-skeleton type="text" class="text-h6" width="40%" />
        <q-skeleton type="rect" height="300px" class="q-mt-md" />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import AccountBalanceCards from '../components/AccountBalanceCards.vue';
import OpenInvestmentSummary from '../components/OpenInvestmentSummary.vue';
import PerformanceSummary from '../components/PerformanceSummary.vue';
import SymbolRankingTable from '../components/SymbolRankingTable.vue';
import PortfolioEvolutionChart from '../components/PortfolioEvolutionChart.vue';
import ProductDistributionChart from '../components/ProductDistributionChart.vue';
import MonthlyPerformanceChart from '../components/MonthlyPerformanceChart.vue';
import EquityCurveChart from '../components/EquityCurveChart.vue';
import RiskMetricsCards from '../components/RiskMetricsCards.vue';
import PeriodFilter from '../components/PeriodFilter.vue';
import { useAnalyticsStore } from '../AnalyticsStore';

/**
 * Página principal del dashboard de analítica
 * Usa el store de analytics para gestión de estado y filtros de periodo
 */
const store = useAnalyticsStore();

const {
  accountBalance,
  performance,
  symbolsRanking,
  productDistribution,
  portfolioEvolution,
  monthlyPerformance,
  equityCurve,
  riskMetrics,
  loadingCharts,
  loadingAdvanced,
} = storeToRefs(store);

const scopeLabel = computed(() => (store.productScope === 'etf' ? 'Planes ETF' : 'Trading'));
const periodLabel = computed(() => {
  const labels: Record<string, string> = {
    '7d': '7D',
    '30d': '30D',
    '90d': '90D',
    '1y': '1A',
    all: 'Todo',
  };
  return labels[store.period] || store.period;
});

/**
 * Maneja el cambio de periodo
 */
async function onPeriodChange() {
  await store.changePeriod(store.period);
}

async function onProductChange() {
  await store.changeProductScope(store.productScope);
}

async function onPortfolioRangeChange(
  range: '7d' | '1m' | '3m' | '6m' | '1y' | '5y' | 'all',
) {
  await store.setPortfolioRange(range);
}

/**
 * Carga inicial de datos
 */
onMounted(async () => {
  await store.loadDashboard();
  await store.setPortfolioRange('3m');
});
</script>
