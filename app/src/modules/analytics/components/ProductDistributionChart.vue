<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-h6 q-mb-sm">Distribución por Producto</div>
      <div v-if="loading" class="row justify-center q-pa-lg">
        <q-spinner color="primary" size="50px" />
      </div>
      <div v-else-if="!data || data.length === 0" class="row justify-center q-pa-lg">
        <div class="text-grey-6">No hay inversiones activas</div>
      </div>
      <div v-else>
        <apexchart
          type="donut"
          height="300"
          :options="chartOptions"
          :series="series"
        />
        <div class="q-mt-md">
          <div
            v-for="item in data"
            :key="item.product"
            class="row items-center q-mb-sm"
          >
            <div
              class="q-mr-sm"
              :style="{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: productColors[item.product] || '#999',
              }"
            />
            <div class="text-body2">
              <span class="text-weight-medium">{{ item.label }}</span>:
              {{ formatCurrency(item.totalInvested) }}
              ({{ item.percentage.toFixed(1) }}%)
            </div>
          </div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ProductDistributionDto } from '../types';

/**
 * Gráfico de distribución de productos
 * Muestra un donut chart con el porcentaje invertido en cada tipo de producto
 */

interface Props {
  data?: ProductDistributionDto[];
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  loading: false,
});

/**
 * Colores por tipo de producto según plan
 */
const productColors: Record<string, string> = {
  crypto: '#F7931A', // Naranja
  stock: '#1976D2', // Azul
  etf: '#388E3C', // Verde
};

/**
 * Series de datos (valores de inversión)
 */
const series = computed(() => {
  if (!props.data || props.data.length === 0) {
    return [];
  }

  return props.data.map((item) => item.totalInvested);
});

/**
 * Configuración del gráfico ApexCharts
 */
const chartOptions = computed(() => ({
  chart: {
    type: 'donut',
  },
  labels: props.data.map((item) => item.label),
  colors: props.data.map((item) => productColors[item.product] || '#999'),
  legend: {
    show: false, // Leyenda custom debajo
  },
  plotOptions: {
    pie: {
      donut: {
        size: '65%',
        labels: {
          show: true,
          name: {
            show: true,
            fontSize: '14px',
          },
          value: {
            show: true,
            fontSize: '20px',
            fontWeight: 600,
            formatter: (val: string) => {
              return formatCurrency(Number(val));
            },
          },
          total: {
            show: true,
            label: 'Total',
            fontSize: '14px',
            formatter: () => {
              const total = props.data.reduce(
                (sum, item) => sum + item.totalInvested,
                0
              );
              return formatCurrency(total);
            },
          },
        },
      },
    },
  },
  dataLabels: {
    enabled: false,
  },
  tooltip: {
    y: {
      formatter: (value: number) => {
        return formatCurrency(value);
      },
    },
  },
}));

/**
 * Formatea cantidad como moneda EUR
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
</script>
