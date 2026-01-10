<template>
  <q-page>
    <OperationsFilters class="q-mt-md" @filter="handleFilter" />
    <OperationsList class="q-mt-md" :operations="filteredOperations" @delete="handleDelete" />
    <ActionsBtn />
  </q-page>
</template>

<script setup lang="ts">
import { useAppStore } from 'src/stores/app';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import OperationsList from '../components/OperationsList.vue';
import OperationsFilters from '../components/OperationsFilters.vue';
import ActionsBtn from '../components/ActionsBtn.vue';
import { useOperationsStore } from '../OperationsStore';
import { useQuasar } from 'quasar';

const appStore = useAppStore();
const operationsStore = useOperationsStore();
const $q = useQuasar();
const isMobile = computed(() => $q.screen.lt.md);

const filters = ref({
  status: '',
  product: '',
});

onMounted(async () => {
  await operationsStore.fetchOperations();
});

onUnmounted(() => {
  appStore.setSection(null);
});

const openOperationsCount = computed(() => operationsStore.openOperations.length);
const totalBalance = computed(() => operationsStore.totalBalance);

watch(
  [openOperationsCount, totalBalance, isMobile],
  () => {
    const balanceLabel = `Operaciones: ${totalBalance.value.toFixed(2)} €`;
    const fullLabel = `Operaciones: ${openOperationsCount.value} abiertas | Balance: ${totalBalance.value.toFixed(2)} €`;
    appStore.setSection(isMobile.value ? balanceLabel : fullLabel);
  },
  { immediate: true },
);

const filteredOperations = computed(() => {
  let ops = operationsStore.operations;

  if (filters.value.status) {
    ops = ops.filter((op) => op.status === filters.value.status);
  }

  if (filters.value.product) {
    ops = ops.filter((op) => op.product === filters.value.product);
  }

  return ops;
});

const handleFilter = (newFilters: { status: string; product: string }) => {
  filters.value = newFilters;
};

const handleDelete = (operationId: string): void => {
  $q.dialog({
    title: 'Eliminar Operación',
    message: '¿Estás seguro de que deseas eliminar esta operación y todas sus entradas?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void confirmDelete(operationId);
  });
};

const confirmDelete = async (operationId: string) => {
  try {
    await operationsStore.deleteOperation(operationId);
    $q.notify({
      type: 'positive',
      message: 'Operación eliminada correctamente',
    });
  } catch (error) {
    console.error('Error deleting operation:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al eliminar operación',
    });
  }
};
</script>
