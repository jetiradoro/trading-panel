<template>
  <div class="row q-col-gutter-md">
    <div class="col-12">
      <div class="row items-center justify-between q-mb-sm">
        <div class="row items-center q-gutter-sm">
          <div class="text-h6">Métricas de Riesgo</div>
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
    </div>

    <div v-if="loading" class="col-12">
      <div class="row justify-center q-pa-lg">
        <q-spinner color="primary" size="50px" />
      </div>
    </div>

    <template v-else-if="data">
      <div class="col-12 col-sm-6 col-md-3">
        <kpi-card
          label="Sharpe Ratio"
          :value="data.sharpeRatio"
          format="number"
          :subtitle="sharpeRatioLabel"
        />
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <kpi-card
          label="Max Drawdown"
          :value="data.maxDrawdown"
          format="currency"
          :subtitle="`${data.maxDrawdownPercentage.toFixed(2)}% del capital`"
        />
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <kpi-card
          label="Profit Factor"
          :value="data.profitFactor"
          format="number"
          :subtitle="profitFactorLabel"
        />
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <kpi-card
          label="Avg Win / Loss"
          :value="winLossRatio"
          format="number"
          :subtitle="`Win: ${formatCurrency(data.avgWin)} | Loss: ${formatCurrency(data.avgLoss)}`"
        />
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <kpi-card
          label="Mayor Ganancia"
          :value="data.largestWin"
          format="currency"
          subtitle="Mejor operación"
        />
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <kpi-card
          label="Mayor Pérdida"
          :value="data.largestLoss"
          format="currency"
          subtitle="Peor operación"
        />
      </div>
    </template>

    <info-modal
      v-model="showInfo"
      title="Métricas de Riesgo"
      :content="infoContent"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import KpiCard from './KpiCard.vue';
import InfoModal from './InfoModal.vue';
import type { RiskMetricsDto } from '../types';

/**
 * Componente de tarjetas de métricas de riesgo
 * Muestra indicadores clave de gestión de riesgo y rendimiento
 */

interface Props {
  data?: RiskMetricsDto | undefined;
  loading?: boolean;
  scopeLabel?: string;
  periodLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

const showInfo = ref(false);
const scopeChipColor = computed(() => (
  props.scopeLabel === 'Planes ETF' ? 'light-green-1' : 'light-blue-1'
));
const scopeChipTextColor = computed(() => (
  props.scopeLabel === 'Planes ETF' ? 'green-10' : 'blue-10'
));

const infoContent = `
<p><strong>¿Qué son las métricas de riesgo?</strong></p>
<p>Estas métricas evalúan la calidad de tu trading más allá del simple P&L:</p>
<ul>
  <li><strong>Sharpe Ratio:</strong> Mide el retorno ajustado al riesgo. Valores &gt; 1 son buenos, &gt; 2 excelentes.</li>
  <li><strong>Max Drawdown:</strong> La mayor caída desde un pico. Indica el peor escenario histórico.</li>
  <li><strong>Profit Factor:</strong> Ratio entre ganancias totales y pérdidas totales. Valores &gt; 1.5 son buenos.</li>
  <li><strong>Avg Win/Loss:</strong> Compara la ganancia media vs pérdida media. Idealmente &gt; 1.</li>
  <li><strong>Rachas:</strong> Operaciones ganadas/perdidas consecutivamente. Ayuda a detectar patrones.</li>
</ul>
<p><strong>¿Por qué son importantes?</strong></p>
<p>Un trader puede ser rentable pero con métricas de riesgo pobres, lo que indica suerte o alta exposición.
Estas métricas revelan si tu estrategia es sostenible a largo plazo.</p>
<p><strong>Filtro aplicado:</strong> Estas métricas respetan el periodo seleccionado y la pestaña activa.</p>
`;

/**
 * Etiqueta interpretativa del Sharpe Ratio
 */
const sharpeRatioLabel = computed(() => {
  if (!props.data) return '';
  const ratio = props.data.sharpeRatio;
  if (ratio < 0) return 'Pobre';
  if (ratio < 1) return 'Aceptable';
  if (ratio < 2) return 'Bueno';
  if (ratio < 3) return 'Muy Bueno';
  return 'Excelente';
});

/**
 * Etiqueta interpretativa del Profit Factor
 */
const profitFactorLabel = computed(() => {
  if (!props.data) return '';
  const pf = props.data.profitFactor;
  if (pf < 1) return 'Perdedor';
  if (pf < 1.5) return 'Aceptable';
  if (pf < 2) return 'Bueno';
  if (pf < 3) return 'Muy Bueno';
  return 'Excelente';
});

/**
 * Ratio win/loss
 */
const winLossRatio = computed(() => {
  if (!props.data || props.data.avgLoss === 0) return 0;
  return Math.abs(props.data.avgWin / props.data.avgLoss);
});

/**
 * Formateador de moneda
 */
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};
</script>
