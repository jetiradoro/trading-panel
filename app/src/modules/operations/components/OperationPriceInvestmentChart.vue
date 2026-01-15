<template>
  <q-card flat bordered class="q-mb-md">
    <q-card-section>
      <div class="row items-center justify-between q-mb-sm">
        <div class="text-h6">
          Evolucion de precio e inversion
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
        height="320"
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

interface EntryPoint {
  entryType: string;
  quantity: number;
  price: number;
  tax?: number;
  date: string;
}

interface Props {
  priceHistory?: PriceHistoryPoint[];
  entries?: EntryPoint[];
  symbolCode?: string;
}

const props = withDefaults(defineProps<Props>(), {
  priceHistory: () => [],
  entries: () => [],
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

const hasData = computed(() => props.priceHistory.length > 0 || props.entries.length > 0);

const sortedPriceHistory = computed(() => {
  return [...props.priceHistory].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
});

const sortedEntries = computed(() => {
  return [...props.entries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
});

const maxDateMs = computed(() => {
  const lastPrice = sortedPriceHistory.value.at(-1)?.date;
  const lastEntry = sortedEntries.value.at(-1)?.date;
  const candidates = [lastPrice, lastEntry].filter(Boolean) as string[];
  if (candidates.length === 0) {
    return null;
  }
  return Math.max(...candidates.map((date) => new Date(date).getTime()));
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

const investmentPoints = computed(() => {
  let cumulative = 0;
  return sortedEntries.value.map((entry) => {
    const direction = entry.entryType === 'buy' ? 1 : -1;
    const amount = entry.quantity * entry.price + (entry.tax ?? 0);
    cumulative += direction * amount;
    return {
      x: new Date(entry.date).getTime(),
      y: Number(cumulative.toFixed(2)),
    };
  });
});

const filteredInvestmentPoints = computed(() => {
  if (!rangeStartMs.value) {
    return investmentPoints.value;
  }
  const startMs = rangeStartMs.value;
  const inRange = investmentPoints.value.filter((point) => point.x >= startMs);
  const previousPoint = [...investmentPoints.value]
    .reverse()
    .find((point) => point.x < startMs);

  if (previousPoint) {
    return [{ x: startMs, y: previousPoint.y }, ...inRange];
  }
  return inRange;
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
  {
    name: 'Inversion neta',
    type: 'line',
    data: filteredInvestmentPoints.value,
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
  colors: ['#1976D2', '#21BA45'],
  stroke: {
    curve: 'smooth',
    width: [2, 2],
  },
  dataLabels: {
    enabled: false,
  },
  xaxis: {
    type: 'datetime',
  },
  yaxis: [
    {
      title: {
        text: 'Precio',
      },
      labels: {
        formatter: formatCurrency,
      },
    },
    {
      opposite: true,
      title: {
        text: 'Inversion neta',
      },
      labels: {
        formatter: formatCurrency,
      },
    },
  ],
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
