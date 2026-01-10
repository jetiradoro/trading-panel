<template>
  <q-page padding>
    <div class="row items-center justify-between q-mb-md q-gutter-sm">
      <h5 class="q-my-none col-auto">Dashboard de Analítica</h5>
      <period-filter v-model="store.period" @update:model-value="onPeriodChange" class="col-auto" />
    </div>

    <!-- Balance de cuenta -->
    <account-balance-cards
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
      />
    </div>

    <!-- Métricas de riesgo -->
    <div class="q-mb-lg">
      <risk-metrics-cards
        :data="riskMetrics ?? undefined"
        :loading="loadingAdvanced"
      />
    </div>

    <!-- Gráficos avanzados -->
    <div class="row q-col-gutter-md q-mb-lg">
      <!-- Rendimiento mensual -->
      <div class="col-12 col-md-6">
        <monthly-performance-chart
          :data="monthlyPerformance || []"
          :loading="loadingAdvanced"
        />
      </div>

      <!-- Curva de equity -->
      <div class="col-12 col-md-6">
        <equity-curve-chart
          :data="equityCurve || []"
          :loading="loadingAdvanced"
        />
      </div>
    </div>

    <!-- Ranking de símbolos -->
    <symbol-ranking-table
      v-if="symbolsRanking && symbolsRanking.length > 0"
      :symbols="symbolsRanking"
      :limit="10"
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
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import AccountBalanceCards from '../components/AccountBalanceCards.vue';
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

/**
 * Maneja el cambio de periodo
 */
async function onPeriodChange() {
  await store.changePeriod(store.period);
}

/**
 * Carga inicial de datos
 */
onMounted(async () => {
  await store.loadDashboard();
});
</script>
