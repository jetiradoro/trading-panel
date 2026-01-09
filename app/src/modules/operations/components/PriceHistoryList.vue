<template>
  <q-list v-if="prices.length > 0">
    <q-item v-for="price in sortedPrices" :key="price.id">
      <q-item-section avatar>
        <q-avatar color="blue" text-color="white" size="md">
          <q-icon name="euro" />
        </q-avatar>
      </q-item-section>

      <q-item-section>
        <q-item-label>{{ price.price }} €</q-item-label>
        <q-item-label caption>{{ formatDate(price.date) }}</q-item-label>
      </q-item-section>
    </q-item>
  </q-list>
  <div v-else class="q-pa-md text-center text-grey">No hay precios registrados</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface PriceHistory {
  id: string;
  price: number;
  date: string;
}

const props = defineProps<{
  prices: PriceHistory[];
}>();

const sortedPrices = computed(() => {
  return [...props.prices].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
});

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
</script>
