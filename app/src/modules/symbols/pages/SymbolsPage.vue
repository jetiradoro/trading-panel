<template>
  <q-page class="q-pa-md">
    <div v-if="loading" class="text-center q-pa-md">
      <q-spinner color="primary" size="3em" />
    </div>

    <div v-else>
      <!-- Filtros -->
      <div class="q-pa-md q-mb-sm">
        <div class="row items-center q-col-gutter-md">
          <div class="text-subtitle2 text-grey-8 col-12 col-md-auto">Producto</div>
          <q-btn-toggle
            v-model="filterProduct"
            :options="productFilterOptions"
            unelevated
            rounded
            no-caps
            color="grey-2"
            text-color="grey-8"
            toggle-color="primary"
            toggle-text-color="white"
            size="md"
            spread
            class="col-12 col-md-auto"
          />
          <div class="col" />
          <div class="col-12 col-md-4">
            <q-input
              v-model="search"
              outlined
              dense
              clearable
              debounce="250"
              placeholder="Buscar por codigo o nombre"
              class="full-width"
            >
              <template #append>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
        </div>
      </div>

      <div class="text-caption text-grey-7 text-right q-px-md q-mt-sm">
        Resultados: {{ filteredSymbols.length }}
      </div>

      <!-- Lista de símbolos -->
      <q-list v-if="filteredSymbols.length > 0">
        <SymbolListItem
          v-for="symbol in filteredSymbols"
          :key="symbol.id"
          :symbol="symbol"
          :pnl="symbolPnLMap[symbol.id] ?? 0"
          :operations-count="symbolOperationsCountMap[symbol.id] ?? 0"
          @click="editSymbol(symbol.id)"
          @delete="handleDelete(symbol)"
        />
      </q-list>

      <div v-else class="text-center q-pa-md text-grey">No hay símbolos disponibles</div>
    </div>

    <!-- Botón flotante -->
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab icon="add" color="primary" :to="{ name: 'symbols.new' }" />
    </q-page-sticky>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAppStore } from 'src/stores/app';
import { useSymbolsStore } from '../SymbolsStore';
import { useOperationsStore } from 'src/modules/operations/OperationsStore';
import { products } from 'src/config';
import { useQuasar } from 'quasar';
import SymbolListItem from '../components/SymbolListItem.vue';

const appStore = useAppStore();
const symbolsStore = useSymbolsStore();
const operationsStore = useOperationsStore();
const router = useRouter();
const $q = useQuasar();

appStore.setSection('Símbolos');

const loading = ref(false);
const filterProduct = ref('');
const search = ref('');

onMounted(async () => {
  loading.value = true;
  try {
    await symbolsStore.fetchSymbols();
    await operationsStore.fetchOperations();
  } finally {
    loading.value = false;
  }
});

const productFilterOptions = [
  { label: 'Todos', value: '' },
  ...products.map((p) => ({ label: p.label, value: p.code })),
];

const filteredSymbols = computed(() => {
  let items = symbolsStore.symbols;
  if (filterProduct.value) {
    items = items.filter((s) => s.product === filterProduct.value);
  }
  const searchTerm = search.value.trim().toLowerCase();
  if (searchTerm) {
    items = items.filter((s) => {
      return `${s.code} ${s.name}`.toLowerCase().includes(searchTerm);
    });
  }
  return items;
});

const symbolPnLMap = computed(() => {
  return operationsStore.operations.reduce((acc, op) => {
    const symbolId = op.symbolId;
    if (!symbolId) {
      return acc;
    }
    let pnl = 0;
    if (op.status === 'closed') {
      pnl = op.balance ?? 0;
    } else if (op.status === 'open') {
      pnl = op.metrics?.unrealizedPnL ?? 0;
    }
    acc[symbolId] = (acc[symbolId] ?? 0) + pnl;
    return acc;
  }, {} as Record<string, number>);
});

const symbolOperationsCountMap = computed(() => {
  return operationsStore.operations.reduce((acc, op) => {
    const symbolId = op.symbolId;
    if (!symbolId) {
      return acc;
    }
    acc[symbolId] = (acc[symbolId] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);
});

const editSymbol = (symbolId: string) => {
  void router.push({ name: 'symbols.detail', params: { id: symbolId } });
};

const handleDelete = (symbol: any) => {
  $q.dialog({
    title: 'Eliminar símbolo',
    message: `¿Estás seguro de que deseas eliminar ${symbol.code} - ${symbol.name}?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void confirmDelete(symbol.id);
  });
};

const confirmDelete = async (symbolId: string) => {
  try {
    await symbolsStore.deleteSymbol(symbolId);
    $q.notify({
      type: 'positive',
      message: 'Símbolo eliminado correctamente',
    });
  } catch (error) {
    console.error('Error deleting symbol:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al eliminar símbolo',
    });
  }
};
</script>
