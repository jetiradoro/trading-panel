<template>
  <q-page padding>
    <div class="q-mb-md">
      <h5 class="q-my-sm">Dashboard de Analítica</h5>
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

    <!-- Rendimiento global -->
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

      <!-- Placeholder para gráficos -->
      <div class="col-12 col-md-8">
        <q-card flat bordered>
          <q-card-section class="text-center text-grey-6">
            <p>Próximamente: Gráficos de evolución y distribución</p>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Ranking de símbolos -->
    <symbol-ranking-table
      v-if="symbolsRanking"
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
import { ref, onMounted } from 'vue';
import { api } from 'src/boot/axios';
import AccountBalanceCards from '../components/AccountBalanceCards.vue';
import PerformanceSummary from '../components/PerformanceSummary.vue';
import SymbolRankingTable from '../components/SymbolRankingTable.vue';
import type { AccountBalanceDto, PerformanceDto, SymbolPerformanceDto } from '../types';

/**
 * Página principal del dashboard de analítica
 */
const accountBalance = ref<AccountBalanceDto | null>(null);
const performance = ref<PerformanceDto | null>(null);
const symbolsRanking = ref<SymbolPerformanceDto[] | null>(null);

/**
 * Carga los datos de balance de cuenta
 */
async function loadAccountBalance() {
  try {
    const { data } = await api.get<AccountBalanceDto>('/analytics/account-balance');
    accountBalance.value = data;
  } catch (error) {
    console.error('Error al cargar balance de cuenta:', error);
  }
}

/**
 * Carga las métricas de rendimiento
 */
async function loadPerformance() {
  try {
    const { data } = await api.get<PerformanceDto>('/analytics/performance', {
      params: { period: '30d' }
    });
    performance.value = data;
  } catch (error) {
    console.error('Error al cargar rendimiento:', error);
  }
}

/**
 * Carga el ranking de símbolos
 */
async function loadSymbolsRanking() {
  try {
    const { data } = await api.get<SymbolPerformanceDto[]>('/analytics/symbols-ranking', {
      params: { period: '30d' }
    });
    symbolsRanking.value = data;
  } catch (error) {
    console.error('Error al cargar ranking de símbolos:', error);
  }
}

onMounted(() => {
  void loadAccountBalance();
  void loadPerformance();
  void loadSymbolsRanking();
});
</script>
