<template>
  <q-page class="q-pa-md">
    <div v-if="loading" class="text-center q-pa-md">
      <q-spinner color="primary" size="3em" />
    </div>

    <div v-else-if="operation">
      <!-- Header -->
      <div class="q-mb-md row items-center q-gutter-md">
        <div v-if="operation.symbol?.logo" class="col-auto">
          <router-link v-if="symbolDetailRoute" :to="symbolDetailRoute" class="symbol-link">
            <q-avatar size="80px">
              <img :src="operation.symbol.logo" :alt="operation.symbol.code" />
            </q-avatar>
          </router-link>
          <q-avatar v-else size="80px">
            <img :src="operation.symbol.logo" :alt="operation.symbol.code" />
          </q-avatar>
        </div>
        <div class="col">
          <template v-if="symbolDetailRoute">
            <router-link :to="symbolDetailRoute" class="symbol-link">
              <div class="text-h5">
                {{ operation.symbol?.code || 'N/A' }}
                <q-chip :color="statusColor" text-color="white" size="md">
                  {{ statusLabel }}
                </q-chip>
              </div>
              <div class="text-subtitle2 text-grey">
                {{ operation.symbol?.name || 'N/A' }}
              </div>
            </router-link>
          </template>
          <template v-else>
            <div class="text-h5">
              {{ operation.symbol?.code || 'N/A' }}
              <q-chip :color="statusColor" text-color="white" size="md">
                {{ statusLabel }}
              </q-chip>
            </div>
            <div class="text-subtitle2 text-grey">
              {{ operation.symbol?.name || 'N/A' }}
            </div>
          </template>
          <div class="text-subtitle2 text-grey">
            <span :class="`text-${typeColor}`">{{ typeLabel }}</span> · {{ productLabel }}
          </div>
        </div>
      </div>

      <!-- Info cards -->
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-6" v-if="operation.status === 'closed' && operation.balance !== undefined">
          <q-card flat bordered class="full-height">
            <q-card-section>
              <div class="text-caption text-grey">Balance</div>
              <div :class="balanceRowClass">
                <div
                  class="text-h6"
                  :class="operation.balance >= 0 ? 'text-positive' : 'text-negative'"
                >
                  {{ operation.balance.toFixed(2) }} €
                </div>
                <div v-if="closedDurationDays !== null" class="text-caption text-grey">
                  {{ closedDurationDays }} días abierta
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-6" v-if="operation.totalFees !== undefined">
          <q-card flat bordered class="full-height">
            <q-card-section>
              <div class="text-caption text-grey">Comisiones</div>
              <div class="text-h6">{{ operation.totalFees.toFixed(2) }} €</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-6" v-if="operation.status === 'open'">
          <q-card flat bordered class="full-height">
            <q-card-section>
              <div class="text-caption text-grey">% Ganancia/Pérdida</div>
              <div
                v-if="
                  operation.metrics?.pnlPercentage !== undefined &&
                  operation.metrics?.pnlPercentage !== null
                "
                class="text-h6"
                :class="operation.metrics.pnlPercentage >= 0 ? 'text-positive' : 'text-negative'"
              >
                {{ operation.metrics.pnlPercentage >= 0 ? '+' : ''
                }}{{ operation.metrics.pnlPercentage.toFixed(2) }}%
              </div>
              <div v-else class="text-h6 text-grey-6">
                <q-icon name="warning" color="orange" />
                Sin precio actual
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-6" v-if="operation.status === 'open'">
          <q-card flat bordered class="full-height">
            <q-card-section>
              <div class="text-caption text-grey">Ganancia/Pérdida €</div>
              <div
                v-if="
                  operation.metrics?.unrealizedPnL !== undefined &&
                  operation.metrics?.unrealizedPnL !== null
                "
                class="text-h6"
                :class="operation.metrics.unrealizedPnL >= 0 ? 'text-positive' : 'text-negative'"
              >
                {{ operation.metrics.unrealizedPnL.toFixed(2) }} €
              </div>
              <div v-else class="text-h6 text-grey-6">
                <q-icon name="warning" color="orange" />
                Sin precio actual
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div
          class="col-6"
          v-if="operation.status === 'open' && operation.metrics?.currentInvestment"
        >
          <q-card flat bordered class="full-height">
            <q-card-section>
              <div class="text-caption text-grey">{{ currentInvestmentLabel }}</div>
              <div class="text-h6">{{ operation.metrics.currentInvestment.toFixed(2) }} €</div>
            </q-card-section>
          </q-card>
        </div>

        <div
          class="col-6"
          v-if="operation.status === 'open' && operation.metrics?.currentMargin"
        >
          <q-card flat bordered class="full-height">
            <q-card-section>
              <div class="text-caption text-grey">Margen actual</div>
              <div class="text-h6">{{ operation.metrics.currentMargin.toFixed(2) }} €</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-6" v-if="operation.product === 'derivative'">
          <q-card flat bordered class="full-height">
            <q-card-section>
              <div class="text-caption text-grey">Apalancamiento</div>
              <div class="text-h6">{{ leverageLabel }}</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-6" v-if="operation.status === 'open'">
          <q-card flat bordered class="full-height">
            <q-card-section>
              <div class="text-caption text-grey">Cantidad actual</div>
              <div class="text-h6">{{ operation.metrics?.currentQty?.toFixed(4) || '0' }}</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-6" v-if="operation.status === 'open' && operation.metrics?.avgBuyPrice">
          <q-card flat bordered class="full-height">
            <q-card-section>
              <div class="text-caption text-grey">Precio medio</div>
              <div class="text-h6">{{ operation.metrics.avgBuyPrice.toFixed(2) }} €</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Entradas -->
      <q-card flat bordered class="q-mb-md">
        <q-card-section>
          <div class="row items-center">
            <div class="text-h6 col">Entradas</div>
            <q-btn
              v-if="operation.status === 'open'"
              flat
              dense
              round
              icon="add"
              color="primary"
              @click="showEntryForm = true"
            />
          </div>
        </q-card-section>
        <q-separator />
        <EntriesList
          :entries="operation.entries || []"
          @edit="handleEditEntry"
          @delete="handleDeleteEntry"
        />
      </q-card>

      <!-- Precio actual del símbolo -->
      <q-card
        flat
        bordered
        class="q-mb-md"
        v-if="currentPrice"
        :class="{ 'cursor-pointer': symbolDetailRoute }"
        @click="goToSymbolDetail"
      >
        <q-card-section>
          <div class="row items-center">
            <div class="text-h6 col">Precio actual</div>
            <q-chip
              v-if="marketSyncEnabled"
              dense
              :color="marketSyncHasError ? 'negative' : 'positive'"
              text-color="white"
              class="q-mr-sm"
            >
              {{ marketSyncHasError ? 'Sync error' : 'Sync ok' }}
              <q-tooltip v-if="marketSyncHasError">
                {{ marketSyncErrorMessage }}
              </q-tooltip>
            </q-chip>
            <q-btn
              v-if="marketSyncEnabled"
              flat
              dense
              round
              icon="sync"
              color="orange"
              @click.stop="handleManualSync"
            >
              <q-tooltip>Sincronizar precio por market</q-tooltip>
            </q-btn>
            <q-btn
              flat
              dense
              round
              icon="add"
              color="primary"
              @click.stop="showPriceForm = true"
            />
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <div class="row items-center">
            <div class="col">
              <div class="text-h5">{{ currentPrice.price }} €</div>
              <div class="text-caption text-grey">
                {{ formatDate(currentPrice.date) }}
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <OperationPriceInvestmentChart
        v-if="operation"
        :price-history="operation.symbol?.priceHistory || []"
        :entries="operation.entries || []"
        :symbol-code="operation.symbol?.code || ''"
      />

      <!-- Botones de acción -->
      <div class="q-mt-md row q-gutter-sm">
        <q-btn label="Volver" color="primary" :to="{ name: 'operations' }" />
        <q-btn
          v-if="operation.status === 'open'"
          label="Cerrar operación"
          color="warning"
          outline
          @click="confirmCloseOperation"
        />
        <q-btn
          v-else
          label="Reabrir operación"
          color="primary"
          outline
          @click="confirmOpenOperation"
        />
        <q-btn label="Eliminar operación" color="negative" outline @click="confirmDelete" />
      </div>
    </div>

    <div v-else class="text-center q-pa-md text-grey">Operación no encontrada</div>

    <!-- Dialogs -->
    <EntryForm
      v-model="showEntryForm"
      :operation-id="operationId"
      :edit-entry="editingEntry"
      @saved="refreshOperation"
    />

    <PriceHistoryForm
      v-if="operation?.symbolId"
      v-model="showPriceForm"
      :symbol-id="operation.symbolId"
      @saved="refreshOperation"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAppStore } from 'src/stores/app';
import { useOperationsStore } from '../OperationsStore';
import { useSymbolsStore } from 'src/modules/symbols/SymbolsStore';
import { operationTypes, operationStatus, products } from 'src/config';
import EntriesList from '../components/EntriesList.vue';
import EntryForm from '../components/EntryForm.vue';
import PriceHistoryForm from 'src/modules/symbols/components/PriceHistoryForm.vue';
import OperationPriceInvestmentChart from '../components/OperationPriceInvestmentChart.vue';
import { useQuasar } from 'quasar';

const appStore = useAppStore();
const operationsStore = useOperationsStore();
const symbolsStore = useSymbolsStore();
const route = useRoute();
const router = useRouter();
const $q = useQuasar();

const operationId = computed(() => route.params.id as string);
const loading = ref(false);
const showEntryForm = ref(false);
const showPriceForm = ref(false);
const editingEntry = ref(null);

const operation = computed(() => operationsStore.currentOperation);
const symbolDetailRoute = computed(() => {
  const symbolId = operation.value?.symbolId;
  return symbolId ? { name: 'symbols.detail', params: { id: symbolId } } : null;
});

const currentPrice = computed(() => {
  return operation.value?.symbol?.priceHistory?.[0] || null;
});

const marketSyncEnabled = computed(() => {
  const symbol = operation.value?.symbol;
  return !!symbol?.marketCode && !!symbol?.marketProvider;
});
const marketSyncHasError = computed(
  () => operation.value?.symbol?.marketSyncStatus === 'error',
);
const marketSyncErrorMessage = computed(
  () => operation.value?.symbol?.marketSyncError || '',
);

const handleManualSync = async () => {
  if (!marketSyncEnabled.value || !operation.value?.symbolId) {
    $q.notify({
      type: 'negative',
      message: 'Market Sync no configurado',
    });
    return;
  }

  try {
    const result = await symbolsStore.manualMarketSync(operation.value.symbolId);
    await refreshOperation();
    $q.notify({
      type: 'positive',
      message: result?.skipped
        ? 'Sin cambios (precio ya registrado)'
        : 'Sincronizacion completada',
    });
  } catch (error) {
    const status = (error as any)?.response?.status;
    const responseMessage =
      (error as any)?.response?.data?.message ||
      (error as any)?.message ||
      symbolsStore.error ||
      '';
    const notFoundMessage = operation.value?.symbol?.marketCode
      ? `El código ${operation.value?.symbol?.marketCode} es incorrecto o no se encuentra`
      : 'El código es incorrecto o no se encuentra';
    $q.notify({
      type: 'negative',
      message:
        status === 404
          ? notFoundMessage
          : responseMessage || 'Error al sincronizar',
    });
  }
};

onMounted(async () => {
  await refreshOperation();
});

const refreshOperation = async () => {
  loading.value = true;
  try {
    await operationsStore.fetchOperationDetail(operationId.value);
    appStore.setSection(`Operación: ${operation.value?.symbol?.code || 'Detalle'}`);
  } finally {
    loading.value = false;
  }
};

const typeLabel = computed(() => {
  const op = operation.value;
  if (!op) return '';
  const type = operationTypes.find((t) => t.code === op.type);
  return type?.label || op.type;
});

const typeColor = computed(() => {
  const op = operation.value;
  if (!op) return 'grey';
  return op.type === 'long' ? 'open' : 'orange';
});

const statusLabel = computed(() => {
  const op = operation.value;
  if (!op) return '';
  const status = operationStatus.find((s) => s.code === op.status);
  return status?.label || op.status;
});

const statusColor = computed(() => {
  const op = operation.value;
  if (!op) return 'grey';
  const status = operationStatus.find((s) => s.code === op.status);
  return status?.color || 'grey';
});

const productLabel = computed(() => {
  const op = operation.value;
  if (!op) return '';
  const product = products.find((p) => p.code === op.product);
  return product?.label || op.product;
});

const currentInvestmentLabel = computed(() => {
  return operation.value?.product === 'derivative' ? 'Exposición actual' : 'Inversión actual';
});

const leverageLabel = computed(() => {
  const leverage = operation.value?.leverage;
  if (!leverage) return 'No definido';
  return `${leverage.toFixed(2)}x`;
});

const balanceRowClass = computed(() => {
  return $q.screen.gt.xs
    ? 'row items-baseline justify-between no-wrap q-mt-xs'
    : 'column items-start q-mt-xs';
});

const closedDurationDays = computed(() => {
  const op = operation.value;
  if (!op || op.status !== 'closed') return null;
  const entries = op.entries || [];
  const [firstEntry] = entries;
  if (!firstEntry) return null;

  const oldestDate = entries.reduce((oldest, entry) => {
    return new Date(entry.date).getTime() < new Date(oldest).getTime() ? entry.date : oldest;
  }, firstEntry.date);

  const closeEntryType = op.type === 'short' ? 'buy' : 'sell';
  const closingEntries = entries.filter((entry) => entry.entryType === closeEntryType);
  const source = closingEntries.length > 0 ? closingEntries : entries;
  const [firstCloseEntry] = source;
  if (!firstCloseEntry) return null;

  const lastCloseDate = source.reduce((latest, entry) => {
    return new Date(entry.date).getTime() > new Date(latest).getTime() ? entry.date : latest;
  }, firstCloseEntry.date);

  const diffMs = new Date(lastCloseDate).getTime() - new Date(oldestDate).getTime();
  if (Number.isNaN(diffMs) || diffMs < 0) return null;

  return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
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

const handleEditEntry = (entry: any) => {
  editingEntry.value = entry;
  showEntryForm.value = true;
};

const handleDeleteEntry = (entryId: string) => {
  $q.dialog({
    title: 'Eliminar entrada',
    message: '¿Estás seguro de que deseas eliminar esta entrada?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void confirmDeleteEntry(entryId);
  });
};

const confirmDeleteEntry = async (entryId: string) => {
  try {
    await operationsStore.deleteEntry(operationId.value, entryId);
    $q.notify({
      type: 'positive',
      message: 'Entrada eliminada correctamente',
    });
  } catch (error) {
    console.error('Error deleting entry:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al eliminar entrada',
    });
  }
};

const confirmDelete = () => {
  $q.dialog({
    title: 'Eliminar operación',
    message:
      '¿Estás seguro de que deseas eliminar esta operación? Esta acción no se puede deshacer.',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void deleteOperation();
  });
};

const confirmCloseOperation = () => {
  $q.dialog({
    title: 'Cerrar operación',
    message: '¿Quieres cerrar esta operación de forma manual?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void updateOperationStatus('closed');
  });
};

const confirmOpenOperation = () => {
  $q.dialog({
    title: 'Reabrir operación',
    message: '¿Quieres reabrir esta operación?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void updateOperationStatus('open');
  });
};

const updateOperationStatus = async (status: 'open' | 'closed') => {
  try {
    await operationsStore.updateOperationStatus(operationId.value, status);
    $q.notify({
      type: 'positive',
      message: status === 'closed' ? 'Operación cerrada' : 'Operación reabierta',
    });
    await refreshOperation();
  } catch (error) {
    console.error('Error updating operation status:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al actualizar estado de operación',
    });
  }
};

const deleteOperation = async () => {
  try {
    await operationsStore.deleteOperation(operationId.value);
    $q.notify({
      type: 'positive',
      message: 'Operación eliminada correctamente',
    });
    await router.push({ name: 'operations' });
  } catch (error) {
    console.error('Error deleting operation:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al eliminar operación',
    });
  }
};

const goToSymbolDetail = () => {
  if (!symbolDetailRoute.value) return;
  void router.push(symbolDetailRoute.value);
};
</script>

<style scoped>
.symbol-link {
  color: inherit;
  text-decoration: none;
  display: inline-block;
}
</style>
