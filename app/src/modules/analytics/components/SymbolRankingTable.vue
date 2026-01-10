<template>
  <q-card flat bordered class="symbol-ranking-table">
    <q-card-section>
      <div class="row items-center justify-between q-mb-md">
        <div class="text-h6">Ranking de Símbolos</div>
        <div class="text-caption text-grey-7">
          Top {{ topSymbols.length }} de {{ symbols.length }}
        </div>
      </div>

      <!-- Cabecera -->
      <div class="ranking-header row items-center q-py-sm q-gutter-x-sm">
        <div class="col-auto rank-number gt-xs">#</div>
        <div class="col-auto gt-xs" style="width: 32px;"></div>
        <div class="col">Símbolo</div>
        <div class="col-3 col-sm-2 text-right">Invertido</div>
        <div class="col-3 col-sm-2 text-right">P&L</div>
        <div class="col-2 col-sm-1 text-right">%</div>
        <div class="col-2 text-right gt-xs">Tendencia</div>
      </div>

      <q-separator />

      <!-- Lista de símbolos -->
      <div v-if="topSymbols.length > 0">
        <symbol-ranking-item
          v-for="(symbol, index) in topSymbols"
          :key="symbol.symbolId"
          :symbol="symbol"
          :rank="index + 1"
        />
      </div>

      <!-- Estado vacío -->
      <div v-else class="text-center q-py-xl text-grey-6">
        <q-icon name="bar_chart" size="64px" class="q-mb-md" />
        <div>No hay datos de símbolos disponibles</div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import SymbolRankingItem from './SymbolRankingItem.vue';
import type { SymbolPerformanceDto } from '../types';

/**
 * Componente que muestra la tabla de ranking de símbolos
 */
interface Props {
  symbols: SymbolPerformanceDto[];
  limit?: number;
}

const props = withDefaults(defineProps<Props>(), {
  limit: 10,
});

const topSymbols = computed(() => {
  return props.symbols.slice(0, props.limit);
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
