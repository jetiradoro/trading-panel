<template>
  <div>
    <q-list v-for="(data, key) in items" :key="key" class="q-mt-md">
      <q-expansion-item switch-toggle-side :default-opened="data.open" expand-separator dense>
        <template #header>
          <q-item-section>{{ data.month }}</q-item-section>
          <q-item-section side
            >Balance: <b>{{ data.balance.toFixed(2) }} €</b></q-item-section
          >
        </template>
        <TransactionListItem
          v-for="(item, index) in data.transactions"
          :key="index"
          :transaction="item"
          @delete="handleDelete"
        />
      </q-expansion-item>
    </q-list>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useTransactionsStore } from '../TransactionsStore';
import TransactionListItem from './TransactionListItem.vue';
import { useQuasar } from 'quasar';

type Transaction = {
  id: string;
  origin: string;
  date: string;
  description: string;
  amount: number;
  [key: string]: unknown;
};

type GroupedTransactions = {
  month: string;
  balance: number;
  transactions: Transaction[];
  open?: boolean;
  [key: string]: unknown;
};

const store = useTransactionsStore();
const $q = useQuasar();

onMounted(async () => {
  await store.fetchTransactions();
});

const items = computed(() => store.getGroupedByMonth as GroupedTransactions[]);

const handleDelete = (transaction: Transaction): void => {
  $q.dialog({
    title: 'Eliminar Transacción',
    message: `¿Estás seguro de que deseas eliminar la transacción del ${transaction.date} - ${transaction.origin} - ${transaction.description} - ${transaction.amount} €?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void confirmDelete(transaction);
  });
};

const confirmDelete = async (transaction: Transaction) => {
  try {
    await store.deleteTransaction(transaction.id);
    await store.fetchTransactions();
    $q.notify({
      type: 'positive',
      message: 'Transaction deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    $q.notify({
      type: 'negative',
      message: 'Error deleting transaction',
    });
    return;
  }
};
</script>
