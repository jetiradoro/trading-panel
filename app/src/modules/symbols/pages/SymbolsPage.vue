<template>
  <q-page class="q-pa-md">
    <div v-if="loading" class="text-center q-pa-md">
      <q-spinner color="primary" size="3em" />
    </div>

    <div v-else>
      <!-- Filtros -->
      <q-select
        v-model="filterProduct"
        :options="productFilterOptions"
        label="Filtrar por producto"
        outlined
        dense
        clearable
        emit-value
        map-options
        class="q-mb-md"
      />

      <!-- Lista de símbolos -->
      <q-list v-if="filteredSymbols.length > 0" bordered separator>
        <q-item
          v-for="symbol in filteredSymbols"
          :key="symbol.id"
          clickable
          @click="editSymbol(symbol.id)"
        >
          <q-item-section avatar>
            <q-avatar v-if="symbol.logo" size="md">
              <img :src="symbol.logo" :alt="symbol.code" />
            </q-avatar>
            <q-avatar v-else :color="productColor(symbol.product)" text-color="white" size="md">
              <q-icon :name="productIcon(symbol.product)" />
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label>{{ symbol.code }}</q-item-label>
            <q-item-label caption>{{ symbol.name }}</q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-badge :color="productColor(symbol.product)" :label="productLabel(symbol.product)" />
          </q-item-section>

          <q-item-section side>
            <q-btn
              flat
              dense
              round
              icon="delete"
              color="negative"
              size="sm"
              @click.stop="handleDelete(symbol)"
            />
          </q-item-section>
        </q-item>
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
import { products } from 'src/config';
import { useQuasar } from 'quasar';

const appStore = useAppStore();
const symbolsStore = useSymbolsStore();
const router = useRouter();
const $q = useQuasar();

appStore.setSection('Símbolos');

const loading = ref(false);
const filterProduct = ref('');

onMounted(async () => {
  loading.value = true;
  try {
    await symbolsStore.fetchSymbols();
  } finally {
    loading.value = false;
  }
});

const productFilterOptions = [
  { label: 'Todos', value: '' },
  ...products.map((p) => ({ label: p.label, value: p.code })),
];

const filteredSymbols = computed(() => {
  if (!filterProduct.value) return symbolsStore.symbols;
  return symbolsStore.symbols.filter((s) => s.product === filterProduct.value);
});

const productLabel = (productCode: string) => {
  const product = products.find((p) => p.code === productCode);
  return product?.label || productCode;
};

const productColor = (productCode: string) => {
  switch (productCode) {
    case 'crypto':
      return 'orange';
    case 'stock':
      return 'blue';
    case 'etf':
      return 'purple';
    default:
      return 'grey';
  }
};

const productIcon = (productCode: string) => {
  switch (productCode) {
    case 'crypto':
      return 'currency_bitcoin';
    case 'stock':
      return 'show_chart';
    case 'etf':
      return 'account_balance';
    default:
      return 'help';
  }
};

const editSymbol = (symbolId: string) => {
  void router.push({ name: 'symbols.edit', params: { id: symbolId } });
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
