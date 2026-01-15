<template>
  <q-card flat bordered class="q-mb-md">
    <q-card-section>
      <div class="row items-center justify-between q-mb-sm">
        <div class="text-h6">
          Evolucion de precio
          <span v-if="symbolCode" class="text-caption text-grey-7 q-ml-xs">({{ symbolCode }})</span>
        </div>
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
      </div>

      <div v-if="!hasData" class="text-grey-6 q-pa-md text-center">
        No hay datos suficientes para el grafico
      </div>

      <apexchart
        v-else
        type="line"
        height="300"
        :options="chartOptions"
        :series="series"
      />
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

interface PriceHistoryPoint {
  date: string;
  price: number;
}

interface Props {
  priceHistory?: PriceHistoryPoint[];
  symbolCode?: string;
}

const props = withDefaults(defineProps<Props>(), {
  priceHistory: () => [],
  symbolCode: '',
});

const range = ref<'7d' | '1m' | '3m' | '6m' | '1y' | 'all'>('3m');
const rangeOptions = [
  { label: '7D', value: '7d' },
  { label: '1M', value: '1m' },
  { label: '3M', value: '3m' },
  { label: '6M', value: '6m' },
  { label: '1A', value: '1y' },
  { label: 'Todo', value: 'all' },
];

const hasData = computed(() => props.priceHistory.length > 0);

const sortedPriceHistory = computed(() => {
  return [...props.priceHistory].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
});

const maxDateMs = computed(() => {
  const lastPrice = sortedPriceHistory.value.at(-1)?.date;
  if (!lastPrice) {
    return null;
  }
  return new Date(lastPrice).getTime();
});

const subtractDays = (ms: number, days: number) => {
  const date = new Date(ms);
  date.setDate(date.getDate() - days);
  return date.getTime();
};

const subtractMonths = (ms: number, months: number) => {
  const date = new Date(ms);
  date.setMonth(date.getMonth() - months);
  return date.getTime();
};

const subtractYears = (ms: number, years: number) => {
  const date = new Date(ms);
  date.setFullYear(date.getFullYear() - years);
  return date.getTime();
};

const rangeStartMs = computed(() => {
  if (!maxDateMs.value || range.value === 'all') {
    return null;
  }
  switch (range.value) {
    case '7d':
      return subtractDays(maxDateMs.value, 7);
    case '1m':
      return subtractMonths(maxDateMs.value, 1);
    case '3m':
      return subtractMonths(maxDateMs.value, 3);
    case '6m':
      return subtractMonths(maxDateMs.value, 6);
    case '1y':
      return subtractYears(maxDateMs.value, 1);
    default:
      return null;
  }
});

const filteredPriceHistory = computed(() => {
  if (!rangeStartMs.value) {
    return sortedPriceHistory.value;
  }
  return sortedPriceHistory.value.filter(
    (point) => new Date(point.date).getTime() >= rangeStartMs.value!,
  );
});

const series = computed(() => [
  {
    name: 'Precio',
    type: 'line',
    data: filteredPriceHistory.value.map((point) => ({
      x: new Date(point.date).getTime(),
      y: point.price,
    })),
  },
]);

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const chartOptions = computed(() => ({
  chart: {
    type: 'line',
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
  colors: ['#1976D2'],
  stroke: {
    curve: 'smooth',
    width: 2,
  },
  dataLabels: {
    enabled: false,
  },
  xaxis: {
    type: 'datetime',
  },
  yaxis: {
    labels: {
      formatter: formatCurrency,
    },
  },
  tooltip: {
    shared: true,
    theme: 'dark',
    x: {
      format: 'dd MMM yyyy',
    },
    y: {
      formatter: formatCurrency,
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
