<template>
  <q-page>
    <TransactionsList />
  </q-page>
</template>
<script setup lang="ts">
import { useAppStore } from 'src/stores/app';
import { computed, onUnmounted, watchEffect } from 'vue';
import TransactionsList from '../components/TransactionsList.vue';
import { useTransactionsStore } from '../TransactionsStore';

const appStore = useAppStore();
const transactionsStore = useTransactionsStore();

onUnmounted(() => {
  appStore.setSection(null);
});

const balance = computed(() => transactionsStore.getBalance);

appStore.setSection(`Transacciones:  ${balance.value || 0} €`);

watchEffect(() => {
  appStore.setSection(`Transacciones:  ${balance.value || 0} €`);
});
</script>
