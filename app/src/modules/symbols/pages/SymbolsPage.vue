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
        <div
          v-for="symbol in filteredSymbols"
          :key="symbol.id"
          class="symbol-drag-wrapper"
          :class="{ 'symbol-drag-wrapper--over': dragOverId === symbol.id }"
          @dragover.prevent="onDragOver(symbol.id)"
          @drop.prevent="onDrop(symbol.id)"
        >
          <SymbolListItem
            :symbol="symbol"
            :pnl="symbolPnLMap[symbol.id] ?? 0"
            :operations-count="symbolOperationsCountMap[symbol.id] ?? 0"
            :draggable="canReorder"
            @click="editSymbol(symbol.id)"
            @delete="handleDelete(symbol)"
            @dragstart="onDragStart"
            @dragend="onDragEnd"
          />
        </div>
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
const dragSourceId = ref<string | null>(null);
const dragOverId = ref<string | null>(null);

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
  let items = [...symbolsStore.symbols].sort((a, b) => a.sortOrder - b.sortOrder);
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

const canReorder = computed(() => filterProduct.value === '' && search.value.trim() === '');

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

const moveSymbol = (ids: string[], fromId: string, toId: string) => {
  const fromIndex = ids.indexOf(fromId);
  const toIndex = ids.indexOf(toId);
  if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
    return ids;
  }
  const next = [...ids];
  const [moved] = next.splice(fromIndex, 1);
  if (!moved) {
    return ids;
  }
  next.splice(toIndex, 0, moved);
  return next;
};

const onDragStart = (symbolId: string) => {
  if (!canReorder.value) return;
  dragSourceId.value = symbolId;
};

const onDragOver = (symbolId: string) => {
  if (!canReorder.value) return;
  dragOverId.value = symbolId;
};

const onDragEnd = () => {
  dragSourceId.value = null;
  dragOverId.value = null;
};

const onDrop = async (targetId: string) => {
  if (!canReorder.value || !dragSourceId.value) return;
  const ids = filteredSymbols.value.map((symbol) => symbol.id);
  const nextOrder = moveSymbol(ids, dragSourceId.value, targetId);
  dragSourceId.value = null;
  dragOverId.value = null;

  try {
    await symbolsStore.reorderSymbols(nextOrder);
    $q.notify({
      type: 'positive',
      message: 'Orden actualizado',
    });
  } catch {
    $q.notify({
      type: 'negative',
      message: 'No se pudo guardar el orden',
    });
  }
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

<style scoped>
.symbol-drag-wrapper--over {
  outline: 1px dashed rgba(255, 255, 255, 0.4);
}
</style>
