<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="row items-center justify-between q-mb-sm">
        <div class="row items-center q-gutter-sm">
          <div class="text-h6">Rendimiento Diario</div>
          <q-chip v-if="scopeLabel" dense :color="scopeChipColor" :text-color="scopeChipTextColor">
            {{ scopeLabel }}
          </q-chip>
          <q-chip v-if="periodLabel" dense color="amber-1" text-color="amber-9">
            Periodo {{ periodLabel }}
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
          <q-btn-toggle
            v-model="valueMode"
            :options="modeOptions"
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

      <div v-else-if="!data || data.length === 0" class="row justify-center q-pa-lg">
        <div class="text-grey-6">Aun no hay snapshots diarios registrados</div>
      </div>

      <div v-else-if="filteredData.length === 0" class="row justify-center q-pa-lg">
        <div class="text-grey-6">No hay datos en el rango seleccionado</div>
      </div>

      <apexchart
        v-else
        :key="chartKey"
        type="line"
        height="300"
        :options="chartOptions"
        :series="series"
      />
    </q-card-section>

    <info-modal
      v-model="showInfo"
      title="Rendimiento Diario"
      :content="infoContent"
    />
  </q-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useQuasar } from 'quasar';
import InfoModal from './InfoModal.vue';
import type { DailyPerformancePointDto } from '../types';

interface Props {
  data?: DailyPerformancePointDto[];
  loading?: boolean;
  scopeLabel?: string;
  periodLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  loading: false,
});

const showInfo = ref(false);
const valueMode = ref<'percent' | 'eur'>('percent');
const range = ref<'1m' | '3m' | '6m' | '1y' | 'all'>('all');
const modeOptions = [
  { label: '%', value: 'percent' },
  { label: 'EUR', value: 'eur' },
];
const rangeOptions = [
  { label: '1M', value: '1m' },
  { label: '3M', value: '3m' },
  { label: '6M', value: '6m' },
  { label: '1A', value: '1y' },
  { label: 'Todo', value: 'all' },
];
const $q = useQuasar();
const isMobile = computed(() => $q.screen.lt.sm);

const scopeChipColor = computed(() => (
  props.scopeLabel === 'Planes ETF' ? 'light-green-1' : 'light-blue-1'
));
const scopeChipTextColor = computed(() => (
  props.scopeLabel === 'Planes ETF' ? 'green-10' : 'blue-10'
));

const infoContent = `
<p><strong>¿Qué muestra este gráfico?</strong></p>
<p>La evolución diaria del mismo valor de <strong>Rendimiento Global</strong> guardado automáticamente cada día.</p>
<ul>
  <li><strong>Modo %:</strong> P&L porcentual total.</li>
  <li><strong>Modo EUR:</strong> P&L total en euros.</li>
  <li><strong>Línea base en 0%:</strong> Separacion clara entre ganancias y perdidas.</li>
</ul>
<p><strong>Nota:</strong> Este widget depende de snapshots diarios generados por tarea programada.</p>
`;

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatPercent = (value: number) => `${value.toFixed(2)}%`;

const yField = computed<'totalPnLPercentage' | 'totalPnL'>(() =>
  valueMode.value === 'percent' ? 'totalPnLPercentage' : 'totalPnL',
);

const maxDateMs = computed(() => {
  const last = props.data?.at(-1)?.date;
  return last ? new Date(last).getTime() : null;
});

const rangeStartMs = computed(() => {
  if (!maxDateMs.value || range.value === 'all') return null;
  const date = new Date(maxDateMs.value);
  switch (range.value) {
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
  return props.data.filter((point) => {
    const pointTime = new Date(`${point.date}T00:00:00`).getTime();
    return pointTime >= rangeStartMs.value!;
  });
});

const series = computed(() => {
  if (!filteredData.value || filteredData.value.length === 0) {
    return [];
  }

  return [
    {
      name: valueMode.value === 'percent' ? 'Rendimiento %' : 'Rendimiento EUR',
      data: filteredData.value.map((point) => ({
        x: new Date(`${point.date}T00:00:00`).getTime(),
        y: Number(point[yField.value].toFixed(4)),
      })),
    },
  ];
});

const maxAbsY = computed(() => {
  if (!filteredData.value || filteredData.value.length === 0) {
    return 1;
  }

  const maxAbs = filteredData.value.reduce((max, point) => {
    const current = Math.abs(Number(point[yField.value] || 0));
    return Math.max(max, current);
  }, 0);

  return maxAbs > 0 ? maxAbs : 1;
});

const yAxisLimit = computed(() => Number((maxAbsY.value * 1.05).toFixed(6)));

const chartKey = computed(() => {
  return [
    valueMode.value,
    range.value,
    props.periodLabel || 'na',
    filteredData.value.length,
    yAxisLimit.value,
  ].join(':');
});

const chartOptions = computed(() => ({
  chart: {
    type: 'line',
    toolbar: {
      show: false,
    },
    zoom: {
      enabled: false,
    },
  },
  colors: ['#1976D2'],
  stroke: {
    curve: 'smooth',
    width: 3,
  },
  dataLabels: {
    enabled: false,
  },
  markers: {
    size: 0,
    hover: {
      size: 5,
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
    min: -yAxisLimit.value,
    max: yAxisLimit.value,
    forceNiceScale: false,
    tickAmount: 7,
    labels: {
      show: !isMobile.value,
      formatter: (value: number) =>
        valueMode.value === 'percent'
          ? formatPercent(value)
          : formatCurrency(value),
    },
  },
  annotations: {
    yaxis: [
      {
        y: 0,
        borderColor: '#9E9E9E',
        strokeDashArray: 4,
      },
    ],
  },
  tooltip: {
    theme: 'dark',
    x: {
      format: 'dd MMM yyyy',
    },
    y: {
      formatter: (value: number) =>
        valueMode.value === 'percent'
          ? formatPercent(value)
          : formatCurrency(value),
    },
  },
  grid: {
    borderColor: '#e0e0e0',
  },
}));
</script>
