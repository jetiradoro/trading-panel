<template>
  <q-page>
    <OperationsFilters class="q-mt-md" @filter="handleFilter" />
    <div class="row items-center justify-between text-caption text-grey-7 q-px-md q-mt-sm">
      <div class="row items-center q-gutter-md">
        <span>Trading P&L: {{ filteredTradingBalance.toFixed(2) }} €</span>
        <span>Trading Invertido: {{ filteredTradingInvestment.toFixed(2) }} €</span>
        <span>ETF P&L: {{ filteredEtfBalance.toFixed(2) }} €</span>
        <span>ETF Invertido: {{ filteredEtfInvestment.toFixed(2) }} €</span>
      </div>
      <div>Resultados: {{ filteredOperations.length }}</div>
    </div>
    <OperationsList class="q-mt-md" :groups="groupedOperations" @delete="handleDelete" />
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
  status: 'open',
  product: '',
  search: '',
});

onMounted(async () => {
  await operationsStore.fetchOperations();
});

onUnmounted(() => {
  appStore.setSection(null);
});

const filteredOperations = computed(() => {
  let ops = operationsStore.operations;

  if (filters.value.status) {
    ops = ops.filter((op) => op.status === filters.value.status);
  }

  if (filters.value.product) {
    ops = ops.filter((op) => op.product === filters.value.product);
  }

  const searchTerm = filters.value.search.trim().toLowerCase();
  if (searchTerm) {
    ops = ops.filter((op) => {
      const code = op.symbol?.code ?? '';
      const name = op.symbol?.name ?? '';
      return `${code} ${name}`.toLowerCase().includes(searchTerm);
    });
  }

  return ops;
});

const formatMonthLabel = (date: Date) => {
  const label = date.toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric',
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
};

const groupedOperations = computed(() => {
  const groups: { title: string; operations: typeof filteredOperations.value }[] = [];
  filteredOperations.value.forEach((op) => {
    const dateString = op.entries?.[0]?.date ?? op.createdAt;
    const date = new Date(dateString);
    const title = formatMonthLabel(date);
    const lastGroup = groups[groups.length - 1];
    if (!lastGroup || lastGroup.title !== title) {
      groups.push({ title, operations: [op] });
    } else {
      lastGroup.operations.push(op);
    }
  });
  return groups;
});

const filteredOpenCount = computed(
  () => filteredOperations.value.filter((op) => op.status === 'open').length,
);

const filteredEtfBalance = computed(() => {
  return filteredOperations.value.reduce((acc, op) => {
    if (op.product !== 'etf') {
      return acc;
    }
    if (op.status === 'closed') {
      return acc + (op.balance ?? 0);
    }
    if (op.status === 'open') {
      return acc + (op.metrics?.unrealizedPnL ?? 0);
    }
    return acc;
  }, 0);
});

const filteredTradingBalance = computed(() => {
  return filteredOperations.value.reduce((acc, op) => {
    if (op.product === 'etf') {
      return acc;
    }
    if (op.status === 'closed') {
      return acc + (op.balance ?? 0);
    }
    if (op.status === 'open') {
      return acc + (op.metrics?.unrealizedPnL ?? 0);
    }
    return acc;
  }, 0);
});

const filteredEtfInvestment = computed(() => {
  return filteredOperations.value.reduce((acc, op) => {
    if (op.product !== 'etf' || op.status !== 'open') {
      return acc;
    }
    return acc + (op.metrics?.currentInvestment ?? 0);
  }, 0);
});

const filteredTradingInvestment = computed(() => {
  return filteredOperations.value.reduce((acc, op) => {
    if (op.product === 'etf' || op.status !== 'open') {
      return acc;
    }
    return acc + (op.metrics?.currentInvestment ?? 0);
  }, 0);
});

watch(
  [filteredOpenCount, isMobile],
  () => {
    const label = `Operaciones: ${filteredOpenCount.value} abiertas`;
    appStore.setSection(label);
  },
  { immediate: true },
);

const handleFilter = (newFilters: { status: string; product: string; search: string }) => {
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
