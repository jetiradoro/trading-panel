<template>
  <q-page class="q-pa-md">
    <div v-if="loading" class="text-center q-pa-md">
      <q-spinner color="primary" size="3em" />
    </div>

    <div v-else-if="symbol">
      <!-- Header -->
      <div class="q-mb-md row items-center q-gutter-md">
        <div class="col-auto">
          <q-avatar v-if="symbol.logo" size="80px">
            <img :src="symbol.logo" :alt="symbol.code" />
          </q-avatar>
          <q-avatar v-else :color="productColor" text-color="white" size="80px">
            <q-icon :name="productIcon" size="48px" />
          </q-avatar>
        </div>
        <div class="col">
          <div class="text-h5">{{ symbol.code }}</div>
          <div class="text-subtitle2 text-grey">{{ symbol.name }}</div>
        </div>
      </div>

      <!-- Info cards -->
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12">
          <q-card flat bordered>
            <q-card-section>
              <div class="row items-center justify-between">
                <div>
                  <div class="text-caption text-grey">Producto</div>
                  <div class="text-h6">
                    <q-badge :color="productColor" :label="productLabel" />
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-caption text-grey">P&amp;L total</div>
                  <div class="text-h6" :class="symbolPnLClass">
                    {{ symbolPnL.toFixed(2) }} €
                  </div>
                  <div class="text-caption text-grey q-mt-xs">
                    Operaciones: {{ symbolOperationsCount }}
                  </div>
                </div>
              </div>
              <div v-if="currentPrice" class="q-mt-md">
                <div class="text-caption text-grey">Precio actual</div>
                <div class="text-h6">{{ currentPrice.price.toFixed(2) }} €</div>
                <div class="text-caption text-grey">
                  {{ formatDate(currentPrice.date) }}
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Historial de precios -->
      <q-card flat bordered class="q-mb-md">
        <q-card-section>
          <div class="row items-center">
            <div class="text-h6 col">Historial de precios</div>
            <q-btn flat dense round icon="add" color="primary" @click="showPriceForm = true" />
          </div>
        </q-card-section>
        <q-separator />

        <q-list v-if="priceHistory && priceHistory.length > 0" separator>
          <q-item v-for="price in paginatedPrices" :key="price.id">
            <q-item-section @click="handleEditPrice(price)">
              <q-item-label>{{ price.price.toFixed(2) }} €</q-item-label>
              <q-item-label caption>{{ formatDate(price.date) }}</q-item-label>
            </q-item-section>

            <q-item-section side>
              <div class="row q-gutter-xs">
                <q-btn
                  flat
                  dense
                  round
                  icon="delete"
                  color="negative"
                  size="sm"
                  @click="handleDeletePrice(price.id)"
                />
              </div>
            </q-item-section>
          </q-item>
        </q-list>

        <q-card-section v-else>
          <div class="text-center text-grey">No hay historial de precios</div>
        </q-card-section>

        <q-separator v-if="priceHistory.length > 0" />
        <q-card-section v-if="priceHistory.length > 0">
          <div class="row items-center justify-between q-gutter-sm">
            <q-select
              v-model="rowsPerPage"
              :options="rowsPerPageOptions"
              dense
              outlined
              emit-value
              map-options
              label="Por pagina"
              class="col-12 col-sm-3"
            />
            <q-pagination
              v-model="page"
              :max="totalPages"
              boundary-numbers
              direction-links
              color="primary"
              size="sm"
              class="col-auto"
            />
          </div>
        </q-card-section>
      </q-card>

      <SymbolPriceHistoryChart
        v-if="priceHistory.length > 0"
        :price-history="priceHistory"
        :symbol-code="symbol.code"
      />

      <!-- Botones de acción -->
      <div class="q-mt-md row q-gutter-sm">
        <q-btn label="Volver" color="primary" :to="{ name: 'symbols' }" />
        <q-btn
          label="Editar símbolo"
          color="primary"
          outline
          :to="{ name: 'symbols.edit', params: { id: symbolId } }"
        />
        <q-btn label="Eliminar símbolo" color="negative" outline @click="confirmDelete" />
      </div>
    </div>

    <div v-else class="text-center q-pa-md text-grey">Símbolo no encontrado</div>

    <!-- Dialog para agregar/editar precio -->
    <PriceHistoryForm
      v-model="showPriceForm"
      :symbol-id="symbolId"
      :edit-price="editingPrice"
      @saved="handlePriceSaved"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAppStore } from 'src/stores/app';
import { useSymbolsStore } from '../SymbolsStore';
import { useOperationsStore } from 'src/modules/operations/OperationsStore';
import { products } from 'src/config';
import { useQuasar } from 'quasar';
import PriceHistoryForm from '../components/PriceHistoryForm.vue';
import SymbolPriceHistoryChart from '../components/SymbolPriceHistoryChart.vue';

const appStore = useAppStore();
const symbolsStore = useSymbolsStore();
const operationsStore = useOperationsStore();
const route = useRoute();
const router = useRouter();
const $q = useQuasar();

const symbolId = computed(() => route.params.id as string);
const loading = ref(false);
const showPriceForm = ref(false);
const editingPrice = ref<any>(null);

const symbol = computed(() => symbolsStore.currentSymbol);
const priceHistory = computed(() => symbol.value?.priceHistory || []);
const page = ref(1);
const rowsPerPage = ref(10);
const rowsPerPageOptions = [5, 10, 20, 50];

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(priceHistory.value.length / rowsPerPage.value));
});

const paginatedPrices = computed(() => {
  const start = (page.value - 1) * rowsPerPage.value;
  return priceHistory.value.slice(start, start + rowsPerPage.value);
});

const currentPrice = computed(() => {
  return priceHistory.value?.[0] || null;
});

onMounted(async () => {
  await refreshSymbol();
});

/**
 * Recargar datos del símbolo
 */
const refreshSymbol = async () => {
  loading.value = true;
  try {
    await symbolsStore.fetchSymbol(symbolId.value);
    await symbolsStore.fetchPriceHistory(symbolId.value);
    await operationsStore.fetchOperations({ symbolId: symbolId.value });
    appStore.setSection(`Símbolo: ${symbol.value?.code || 'Detalle'}`);
  } finally {
    loading.value = false;
  }
};

const productLabel = computed(() => {
  const sym = symbol.value;
  if (!sym) return '';
  const product = products.find((p) => p.code === sym.product);
  return product?.label || sym.product;
});

const symbolPnL = computed(() => {
  return operationsStore.operations.reduce((acc, op) => {
    if (op.status === 'closed') {
      return acc + (op.balance ?? 0);
    }
    if (op.status === 'open') {
      return acc + (op.metrics?.unrealizedPnL ?? 0);
    }
    return acc;
  }, 0);
});

const symbolPnLClass = computed(() => {
  return symbolPnL.value >= 0 ? 'text-positive' : 'text-negative';
});

const symbolOperationsCount = computed(() => {
  return operationsStore.operations.length;
});

const productColor = computed(() => {
  const sym = symbol.value;
  if (!sym) return 'grey';
  switch (sym.product) {
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
  const sym = symbol.value;
  if (!sym) return 'help';
  switch (sym.product) {
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

/**
 * Formatear fecha a formato legible
 */
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

/**
 * Abrir formulario para editar precio
 */
const handleEditPrice = (price: any) => {
  editingPrice.value = price;
  showPriceForm.value = true;
};

/**
 * Manejar guardado de precio
 */
const handlePriceSaved = async () => {
  editingPrice.value = null;
  await refreshSymbol();
};

/**
 * Confirmar eliminación de precio
 */
const handleDeletePrice = (priceId: string) => {
  $q.dialog({
    title: 'Eliminar precio',
    message: '¿Estás seguro de que deseas eliminar este precio?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void confirmDeletePrice(priceId);
  });
};

/**
 * Eliminar precio del historial
 */
const confirmDeletePrice = async (priceId: string) => {
  try {
    await symbolsStore.deletePriceHistory(symbolId.value, priceId);
    $q.notify({
      type: 'positive',
      message: 'Precio eliminado correctamente',
    });
  } catch (error) {
    console.error('Error deleting price:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al eliminar precio',
    });
  }
};

/**
 * Confirmar eliminación del símbolo
 */
const confirmDelete = () => {
  $q.dialog({
    title: 'Eliminar símbolo',
    message: `¿Estás seguro de que deseas eliminar ${symbol.value?.code}? Esta acción no se puede deshacer.`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void deleteSymbol();
  });
};

/**
 * Eliminar símbolo
 */
const deleteSymbol = async () => {
  try {
    await symbolsStore.deleteSymbol(symbolId.value);
    $q.notify({
      type: 'positive',
      message: 'Símbolo eliminado correctamente',
    });
    await router.push({ name: 'symbols' });
  } catch (error) {
    console.error('Error deleting symbol:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al eliminar símbolo',
    });
  }
};
</script>
