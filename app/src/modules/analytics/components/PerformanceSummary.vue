<template>
  <q-card flat bordered class="performance-summary">
    <q-card-section>
      <div class="row items-center justify-between q-mb-md">
        <div class="row items-center q-gutter-sm">
          <div class="text-h6">Rendimiento Global</div>
          <q-chip
            v-if="scopeLabel"
            dense
            :color="scopeChipColor"
            :text-color="scopeChipTextColor"
          >
            {{ scopeLabel }}
          </q-chip>
          <q-chip v-if="periodLabel" dense color="amber-1" text-color="amber-9">
            Periodo {{ periodLabel }}
          </q-chip>
        </div>
        <q-btn
          icon="info"
          flat
          dense
          round
          size="sm"
          color="grey-6"
          @click="showInfo = true"
        />
      </div>

      <!-- P&L Total -->
      <div class="row items-baseline q-mb-md">
        <div class="text-h4 text-weight-bold" :class="totalPnLColor">
          {{ formatCurrency(performance.totalPnL) }}
        </div>
        <div class="q-ml-sm text-h6" :class="totalPnLColor">
          {{ formatPercentage(performance.totalPnLPercentage) }}
        </div>
      </div>

      <!-- P&L Desglosado -->
      <div class="row q-col-gutter-sm q-mb-md">
        <div class="col-6">
          <div class="text-caption text-grey-7">P&L Realizado</div>
          <div class="text-subtitle1 text-weight-medium" :class="getPnLColor(performance.realizedPnL)">
            {{ formatCurrency(performance.realizedPnL) }}
          </div>
        </div>
        <div class="col-6">
          <div class="text-caption text-grey-7">P&L No Realizado</div>
          <div class="text-subtitle1 text-weight-medium" :class="getPnLColor(performance.unrealizedPnL)">
            {{ formatCurrency(performance.unrealizedPnL) }}
          </div>
        </div>
      </div>

      <q-separator />

      <!-- Win Rate -->
      <div class="q-mt-md">
        <div class="row items-center justify-between q-mb-xs">
          <div class="text-caption text-grey-7">Win Rate</div>
          <div class="text-subtitle1 text-weight-medium">
            {{ formatPercentage(performance.winRate) }}
          </div>
        </div>

        <!-- Barra de progreso -->
        <q-linear-progress
          :value="performance.winRate / 100"
          color="positive"
          track-color="negative"
          size="8px"
          class="q-mb-sm"
        />

        <!-- Operaciones ganadoras/perdedoras -->
        <div class="row justify-between text-caption">
          <div class="text-positive">
            Ganadoras: {{ performance.winningOperations }}
          </div>
          <div class="text-negative">
            Perdedoras: {{ performance.losingOperations }}
          </div>
        </div>
      </div>
    </q-card-section>

    <info-modal
      v-model="showInfo"
      title="Rendimiento Global"
      :content="infoContent"
    />
  </q-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import InfoModal from './InfoModal.vue';
import type { PerformanceDto } from '../types';

/**
 * Componente que muestra el resumen de rendimiento global
 */
interface Props {
  performance: PerformanceDto;
  scopeLabel?: string;
  periodLabel?: string;
}

const props = defineProps<Props>();

const showInfo = ref(false);

const infoContent = `
<p><strong>¿Qué muestra este widget?</strong></p>
<ul>
  <li><strong>P&L Total:</strong> Ganancia/Pérdida total (realizada + no realizada)</li>
  <li><strong>P&L Realizado:</strong> Ganancias/pérdidas de operaciones cerradas</li>
  <li><strong>P&L No Realizado:</strong> Ganancias/pérdidas potenciales de operaciones abiertas</li>
  <li><strong>Win Rate:</strong> Porcentaje de operaciones ganadoras</li>
</ul>
<p><strong>Interpretación:</strong></p>
<p>Verde = ganancias, Rojo = pérdidas. Un win rate > 50% indica más aciertos que fallos.</p>
<p><strong>Filtro aplicado:</strong> Este widget respeta el periodo seleccionado y la pestaña activa (Trading o Planes ETF).</p>
`;

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
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

const totalPnLColor = computed(() => getPnLColor(props.performance.totalPnL));
const scopeChipColor = computed(() => (
  props.scopeLabel === 'Planes ETF' ? 'light-green-1' : 'light-blue-1'
));
const scopeChipTextColor = computed(() => (
  props.scopeLabel === 'Planes ETF' ? 'green-10' : 'blue-10'
));
</script>

<style scoped lang="scss">
.performance-summary {
  height: 100%;

  .q-card-section {
    padding: 16px;
  }
}
</style>
