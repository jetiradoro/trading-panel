<template>
  <q-card flat bordered class="symbol-ranking-table">
    <q-card-section>
      <div class="row items-center justify-between q-mb-md">
        <div class="row items-center q-gutter-sm">
          <div class="text-h6">Ranking de Símbolos</div>
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
        <div class="row items-center q-gutter-sm">
          <div class="text-caption text-grey-7">
            Mostrando {{ pageStart }}-{{ pageEnd }} de {{ symbols.length }}
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

      <!-- Cabecera -->
      <div class="ranking-header row items-center q-py-sm q-gutter-x-sm">
        <div class="col-auto rank-number gt-xs">#</div>
        <div class="col-auto gt-xs" style="width: 32px;"></div>
        <div class="col">Símbolo</div>
        <div class="col-2 col-sm-2 text-right">Invertido</div>
        <div class="col-2 col-sm-2 text-right">P&L Real.</div>
        <div class="col-2 col-sm-2 text-right">P&L Abierto</div>
        <div class="col-2 col-sm-1 text-right">%</div>
        <div class="col-2 text-right gt-xs">Tendencia</div>
      </div>

      <q-separator />

      <!-- Lista de símbolos -->
      <div v-if="pagedSymbols.length > 0">
        <symbol-ranking-item
          v-for="(symbol, index) in pagedSymbols"
          :key="symbol.symbolId"
          :symbol="symbol"
          :rank="pageStart + index"
        />
      </div>

      <!-- Estado vacío -->
      <div v-else class="text-center q-py-xl text-grey-6">
        <q-icon name="bar_chart" size="64px" class="q-mb-md" />
        <div>No hay datos de símbolos disponibles</div>
      </div>

      <div v-if="symbols.length > 0" class="row items-center justify-between q-mt-md">
        <q-select
          v-model="rowsPerPage"
          :options="[10, 20, 50, 100]"
          dense
          outlined
          label="Resultados"
          style="width: 140px"
        />
        <q-pagination
          v-model="page"
          :max="maxPage"
          max-pages="6"
          boundary-numbers
          direction-links
          flat
          color="primary"
        />
      </div>
    </q-card-section>

    <info-modal
      v-model="showInfo"
      title="Ranking de Símbolos"
      :content="infoContent"
    />
  </q-card>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import InfoModal from './InfoModal.vue';
import SymbolRankingItem from './SymbolRankingItem.vue';
import type { SymbolPerformanceDto } from '../types';

/**
 * Componente que muestra la tabla de ranking de símbolos
 */
interface Props {
  symbols: SymbolPerformanceDto[];
  scopeLabel?: string;
  periodLabel?: string;
}

const props = defineProps<Props>();

const showInfo = ref(false);
const scopeChipColor = computed(() => (
  props.scopeLabel === 'Planes ETF' ? 'light-green-1' : 'light-blue-1'
));
const scopeChipTextColor = computed(() => (
  props.scopeLabel === 'Planes ETF' ? 'green-10' : 'blue-10'
));

const infoContent = `
<p><strong>¿Qué muestra esta tabla?</strong></p>
<p>Ranking de tus símbolos ordenados por P&L total (ganancias/pérdidas).</p>
<p><strong>Columnas:</strong></p>
<ul>
  <li><strong>Invertido:</strong> Dinero actual en ese símbolo</li>
  <li><strong>P&L Real.:</strong> Ganancia/pérdida realizada (operaciones cerradas)</li>
  <li><strong>P&L Abierto:</strong> Ganancia/pérdida no realizada (posiciones abiertas)</li>
  <li><strong>%:</strong> Porcentaje de retorno sobre lo invertido</li>
  <li><strong>Tendencia:</strong> Sparkline de precios recientes</li>
</ul>
<p><strong>Utilidad:</strong> Identificar qué activos te generan más rendimiento.</p>
<p><strong>Filtro aplicado:</strong> Este ranking respeta el periodo seleccionado y la pestaña activa.</p>
`;

const page = ref(1);
const rowsPerPage = ref(10);

const maxPage = computed(() => {
  return Math.max(1, Math.ceil(props.symbols.length / rowsPerPage.value));
});

watch([maxPage, rowsPerPage], () => {
  if (page.value > maxPage.value) {
    page.value = maxPage.value;
  }
});

const pageStart = computed(() => {
  if (props.symbols.length === 0) return 0;
  return (page.value - 1) * rowsPerPage.value + 1;
});

const pageEnd = computed(() => {
  if (props.symbols.length === 0) return 0;
  return Math.min(props.symbols.length, page.value * rowsPerPage.value);
});

const pagedSymbols = computed(() => {
  const start = (page.value - 1) * rowsPerPage.value;
  return props.symbols.slice(start, start + rowsPerPage.value);
});
</script>

<style scoped lang="scss">
.symbol-ranking-table {
  .ranking-header {
    font-weight: 600;
    font-size: 0.75rem;
    text-transform: uppercase;
    color: #666;
    letter-spacing: 0.5px;

    .rank-number {
      width: 32px;
      text-align: center;
    }
  }
}

.body--dark .symbol-ranking-table .ranking-header {
  color: #aaa;
}
</style>
