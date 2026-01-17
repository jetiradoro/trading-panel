<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="row items-center justify-between q-mb-sm">
        <div class="row items-center q-gutter-sm">
          <div class="text-h6">Evolución del Portfolio</div>
          <q-chip v-if="scopeLabel" dense :color="scopeChipColor" :text-color="scopeChipTextColor">
            {{ scopeLabel }}
          </q-chip>
          <q-chip dense color="deep-orange-1" text-color="deep-orange-9">
            Rango {{ rangeLabel }}
          </q-chip>
        </div>
        <div class="row items-center q-gutter-sm">
          <q-btn-toggle
            v-model="range"
            :options="rangeOptions"
            dense
            rounded
            no-caps
            unelevated
            color="grey-2"
            text-color="grey-8"
            toggle-color="primary"
            toggle-text-color="white"
            size="sm"
          />
          <q-btn icon="info" flat dense round size="sm" color="grey-6" @click="showInfo = true" />
        </div>
      </div>
      <div v-if="loading" class="row justify-center q-pa-lg">
        <q-spinner color="primary" size="50px" />
      </div>
      <div v-else-if="!hasData" class="row justify-center q-pa-lg">
        <div class="text-grey-6">No hay datos disponibles en este rango</div>
      </div>
      <apexchart v-else type="area" height="300" :options="chartOptions" :series="series" />
    </q-card-section>

    <info-modal v-model="showInfo" title="Evolución del Portfolio" :content="infoContent" />
  </q-card>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import InfoModal from './InfoModal.vue';
import type { PortfolioPointDto } from '../types';

/**
 * Gráfico de evolución del portfolio
 * Muestra la evolución temporal del dinero invertido vs valor del portfolio
 */

interface Props {
  data?: PortfolioPointDto[];
  loading?: boolean;
  scopeLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  loading: false,
});

const emit = defineEmits<{
  (e: 'range-change', value: '7d' | '1m' | '3m' | '6m' | '1y' | 'all'): void;
}>();

const showInfo = ref(false);
const range = ref<'7d' | '1m' | '3m' | '6m' | '1y' | 'all'>('all');
const rangeOptions = [
  { label: '7D', value: '7d' },
  { label: '1M', value: '1m' },
  { label: '3M', value: '3m' },
  { label: '6M', value: '6m' },
  { label: '1A', value: '1y' },
  { label: 'Todo', value: 'all' },
];

const infoContent = `
<p><strong>¿Qué muestra este gráfico?</strong></p>
<p>Este gráfico compara dos métricas clave de tu portfolio a lo largo del tiempo:</p>
<ul>
  <li><strong>Invertido (azul):</strong> El dinero que has invertido (compras - ventas).</li>
  <li><strong>Valor Portfolio (verde):</strong> El valor actual de mercado de tus inversiones.</li>
</ul>
<p><strong>¿Cómo leerlo?</strong></p>
<ul>
  <li>Si la línea verde está <strong>por encima</strong> de la azul → Estás en ganancias</li>
  <li>Si está <strong>por debajo</strong> → Estás en pérdidas</li>
  <li>La separación entre líneas muestra la magnitud del P&L</li>
</ul>
<p><strong>Consejo:</strong> Usa el selector de rango y las herramientas de zoom/pan para explorar periodos concretos.</p>
<p><strong>Nota:</strong> Este grafico usa su propio rango, independiente del periodo global.</p>
`;

const rangeLabel = computed(() => {
  const labels: Record<string, string> = {
    '7d': '7D',
    '1m': '1M',
    '3m': '3M',
    '6m': '6M',
    '1y': '1A',
    all: 'Todo',
  };
  return labels[range.value] || range.value;
});

const scopeChipColor = computed(() =>
  props.scopeLabel === 'Planes ETF' ? 'light-green-1' : 'light-blue-1',
);
const scopeChipTextColor = computed(() =>
  props.scopeLabel === 'Planes ETF' ? 'green-10' : 'blue-10',
);
const $q = useQuasar();
const isMobile = computed(() => $q.screen.lt.sm);

watch(range, (value) => {
  emit('range-change', value);
});

/**
 * Series de datos para ApexCharts
 */
const maxDateMs = computed(() => {
  const last = props.data?.at(-1)?.date;
  return last ? new Date(last).getTime() : null;
});

const rangeStartMs = computed(() => {
  if (!maxDateMs.value || range.value === 'all') return null;
  const date = new Date(maxDateMs.value);
  switch (range.value) {
    case '7d':
      date.setDate(date.getDate() - 7);
      break;
    case '1m':
      date.setMonth(date.getMonth() - 1);
      break;
    case '3m':
      date.setMonth(date.getMonth() - 3);
      break;
    case '6m':
      date.setMonth(date.getMonth() - 6);
      break;
    case '1y':
      date.setFullYear(date.getFullYear() - 1);
      break;
    default:
      return null;
  }
  return date.getTime();
});

const filteredData = computed(() => {
  if (!props.data || props.data.length === 0) {
    return [];
  }
  if (!rangeStartMs.value) {
    return props.data;
  }
  return props.data.filter((point) => new Date(point.date).getTime() >= rangeStartMs.value!);
});

const hasData = computed(() => filteredData.value.length > 0);

const series = computed(() => {
  if (!filteredData.value || filteredData.value.length === 0) {
    return [];
  }

  return [
    {
      name: 'Invertido',
      data: filteredData.value.map((p) => ({
        x: new Date(p.date).getTime(),
        y: p.totalInvested,
      })),
    },
    {
      name: 'Valor Portfolio',
      data: filteredData.value.map((p) => ({
        x: new Date(p.date).getTime(),
        y: p.portfolioValue,
      })),
    },
  ];
});

/**
 * Configuración del gráfico ApexCharts
 */
const chartOptions = computed(() => ({
  chart: {
    type: 'area',
    toolbar: {
      show: true,
      tools: {
        download: false,
        selection: true,
        zoom: true,
        zoomin: true,
        zoomout: true,
        pan: true,
        reset: true,
      },
    },
    zoom: {
      enabled: true,
    },
    pan: {
      enabled: true,
    },
  },
  colors: ['#1976D2', '#21BA45'],
  dataLabels: {
    enabled: false,
  },
  stroke: {
    curve: 'smooth',
    width: 2,
  },
  fill: {
    type: 'gradient',
    gradient: {
      opacityFrom: 0.6,
      opacityTo: 0.1,
    },
  },
  xaxis: {
    type: 'datetime',
    labels: {
      datetimeUTC: false,
      format: 'dd MMM',
    },
  },
  yaxis: {
    labels: {
      show: !isMobile.value,
      formatter: (value: number) => {
        return new Intl.NumberFormat('es-ES', {
          style: 'currency',
          currency: 'EUR',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value);
      },
    },
  },
  tooltip: {
    theme: 'dark',
    x: {
      format: 'dd MMM yyyy',
    },
    y: {
      formatter: (value: number) => {
        return new Intl.NumberFormat('es-ES', {
          style: 'currency',
          currency: 'EUR',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(value);
      },
    },
  },
  legend: {
    position: 'bottom',
    horizontalAlign: 'left',
  },
  grid: {
    borderColor: '#e0e0e0',
  },
}));
</script>
