<template>
  <div>
    <q-list v-for="(data, key) in items" :key="key" class="">
      <q-expansion-item
        :default-opened="data.open"
        dense
        dense-toggle
        expand-separator
        :label="getMonthName(data)"
        switch-toggle-side
      >
        <q-item
          v-for="(item, index) in data.transactions"
          :key="index"
          clickable
          class="transaction-item"
        >
          <q-item-section>
            <q-item-label>{{ item.origin }}</q-item-label>
            <q-item-label caption>{{ item.date }}</q-item-label>
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-left">{{ item.description }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-item-label class="amount-label">{{ item.amount }} €</q-item-label>
          </q-item-section>
        </q-item>
      </q-expansion-item>
    </q-list>
  </div>
</template>

<style scoped>
.transaction-item {
  min-height: 64px; /* Ajusta el alto mínimo según lo que necesites */
  display: flex;
  align-items: center;
}
.amount-label {
  min-width: 80px; /* Ajusta el ancho mínimo para la columna de importe */
  text-align: right;
  display: inline-block;
}
</style>
<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useTransactionsStore } from '../TransactionsStore';

const store = useTransactionsStore();

onMounted(async () => {
  await store.fetchTransactions();
});

function getMonthName(item: any) {
  return `${item.month}: ${item.balance} €`;
}

const items = computed(() => store.getGroupedByMonth);
</script>
