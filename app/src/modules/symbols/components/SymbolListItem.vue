<template>
  <div class="symbol-item-wrapper">
    <q-item clickable class="symbol-item" @click="$emit('click')">
      <q-item-section avatar>
        <q-avatar v-if="symbol.logo" size="md">
          <img :src="symbol.logo" :alt="symbol.code" />
        </q-avatar>
        <q-avatar v-else :color="productColor" text-color="white" size="md">
          <q-icon :name="productIcon" />
        </q-avatar>
      </q-item-section>

      <q-item-section>
        <q-item-label>{{ symbol.code }}</q-item-label>
        <q-item-label caption>{{ symbol.name }}</q-item-label>
      </q-item-section>

      <q-item-section side class="text-right">
        <q-item-label caption>P&amp;L total</q-item-label>
        <q-item-label :class="pnlClass">{{ pnl.toFixed(2) }} €</q-item-label>
        <q-item-label caption class="q-mt-xs">Operaciones: {{ operationsCount }}</q-item-label>
      </q-item-section>

      <q-item-section side>
        <q-badge :color="productColor" :label="productLabel" />
      </q-item-section>

      <q-item-section side>
        <q-btn
          flat
          dense
          round
          icon="delete"
          color="negative"
          size="sm"
          @click.stop="$emit('delete')"
        />
      </q-item-section>
    </q-item>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { products } from 'src/config';

interface Symbol {
  id: string;
  code: string;
  name: string;
  logo?: string;
  product: string;
}

const props = defineProps<{
  symbol: Symbol;
  pnl: number;
  operationsCount: number;
}>();

defineEmits<{
  click: [];
  delete: [];
}>();

const productLabel = computed(() => {
  const product = products.find((p) => p.code === props.symbol.product);
  return product?.label || props.symbol.product;
});

const productColor = computed(() => {
  switch (props.symbol.product) {
    case 'crypto':
      return 'orange';
    case 'stock':
      return 'blue';
    case 'etf':
      return 'purple';
    default:
      return 'grey';
  }
});

const productIcon = computed(() => {
  switch (props.symbol.product) {
    case 'crypto':
      return 'currency_bitcoin';
    case 'stock':
      return 'show_chart';
    case 'etf':
      return 'account_balance';
    default:
      return 'help';
  }
});

const pnlClass = computed(() => {
  return props.pnl >= 0 ? 'text-positive' : 'text-negative';
});
</script>

<style scoped>
.symbol-item-wrapper {
  margin-bottom: 0.2rem;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}

.symbol-item-wrapper:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.25);
}

.symbol-item {
  min-height: 72px;
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.05);
}

.q-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
