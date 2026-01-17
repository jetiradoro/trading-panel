<template>
  <router-link
    class="symbol-ranking-item symbol-ranking-item--link row items-center q-py-sm q-gutter-x-sm"
    :to="symbolRoute"
  >
    <!-- Posición -->
    <div class="col-auto rank-number gt-xs">
      {{ rank }}
    </div>

    <!-- Logo y nombre -->
    <div class="col-auto gt-xs">
      <q-avatar v-if="symbol.logo" size="32px" square>
        <img :src="symbol.logo" :alt="symbol.code">
      </q-avatar>
      <q-avatar v-else size="32px" color="grey-4" text-color="grey-8" square>
        {{ symbol.code.substring(0, 2) }}
      </q-avatar>
    </div>

    <div class="col">
      <div class="text-weight-medium">{{ symbol.code }}</div>
      <div class="text-caption text-grey-7 gt-xs">{{ symbol.name }}</div>
    </div>

    <!-- Invertido -->
    <div class="col-2 col-sm-2 text-right">
      <div class="text-weight-medium amount-text">{{ formatCurrency(symbol.totalInvested) }}</div>
    </div>

    <!-- P&L Realizado -->
    <div class="col-2 col-sm-2 text-right">
      <div class="text-weight-medium amount-text" :class="getPnLColor(symbol.realizedPnL)">
        {{ formatCurrency(symbol.realizedPnL) }}
      </div>
    </div>

    <!-- P&L Abierto -->
    <div class="col-2 col-sm-2 text-right">
      <div class="text-weight-medium amount-text" :class="getPnLColor(symbol.unrealizedPnL)">
        {{ formatCurrency(symbol.unrealizedPnL) }}
      </div>
    </div>

    <!-- Porcentaje -->
    <div class="col-2 col-sm-1 text-right">
      <div class="text-weight-medium" :class="getPnLColor(symbol.totalPnL)">
        {{ formatPercentage(symbol.pnlPercentage) }}
      </div>
    </div>

    <!-- Sparkline -->
    <div class="col-2 row justify-end gt-xs">
      <sparkline-chart
        :data="symbol.sparklineData"
        :color="getSparklineColor(symbol.totalPnL)"
      />
    </div>
  </router-link>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import SparklineChart from './SparklineChart.vue';
import type { SymbolPerformanceDto } from '../types';

/**
 * Componente que muestra una fila en el ranking de símbolos
 */
interface Props {
  symbol: SymbolPerformanceDto;
  rank: number;
}

const props = defineProps<Props>();
const symbolRoute = computed(() => ({
  name: 'symbols.detail',
  params: { id: props.symbol.symbolId },
}));

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatPercentage = (value: number): string => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
};

const getPnLColor = (value: number): string => {
  if (value > 0) return 'text-positive';
  if (value < 0) return 'text-negative';
  return '';
};

const getSparklineColor = (pnl: number): string => {
  return pnl >= 0 ? '#21BA45' : '#C10015';
};
</script>

<style scoped lang="scss">
.symbol-ranking-item {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  min-height: 56px;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: rgba(0, 0, 0, 0.02);
  }

  .rank-number {
    width: 32px;
    text-align: center;
    font-weight: 500;
    color: #666;
  }

  .amount-text {
    font-size: 0.875rem;

    @media (max-width: 599px) {
      font-size: 0.75rem;
    }
  }
}

.body--dark .symbol-ranking-item {
  border-bottom-color: rgba(255, 255, 255, 0.12);

  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
}

.symbol-ranking-item--link {
  color: inherit;
  text-decoration: none;
  cursor: pointer;
}
</style>
