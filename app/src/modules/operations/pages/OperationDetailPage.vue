<template>
  <q-page class="q-pa-md">
    <div v-if="loading" class="text-center q-pa-md">
      <q-spinner color="primary" size="3em" />
    </div>

    <div v-else-if="operation">
      <!-- Header -->
      <div class="q-mb-md row items-center q-gutter-md">
        <div v-if="operation.symbol?.logo" class="col-auto">
          <q-avatar size="80px">
            <img :src="operation.symbol.logo" :alt="operation.symbol.code" />
          </q-avatar>
        </div>
        <div class="col">
          <div class="text-h5">
            {{ operation.symbol?.code || 'N/A' }}
            <q-chip :color="statusColor" text-color="white" size="md">
              {{ statusLabel }}
            </q-chip>
          </div>
          <div class="text-subtitle2 text-grey">{{ operation.symbol?.name || 'N/A' }}</div>
        </div>
      </div>

      <!-- Info cards -->
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-6">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-caption text-grey">Tipo</div>
              <div class="text-h6">
                <q-badge :color="typeColor" :label="typeLabel" />
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-6">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-caption text-grey">Producto</div>
              <div class="text-h6">{{ productLabel }}</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-6" v-if="operation.status === 'closed' && operation.balance !== undefined">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-caption text-grey">Balance</div>
              <div
                class="text-h6"
                :class="operation.balance >= 0 ? 'text-positive' : 'text-negative'"
              >
                {{ operation.balance.toFixed(2) }} €
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-6" v-if="operation.status === 'open'">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-caption text-grey">Cantidad actual</div>
              <div class="text-h6">{{ operation.metrics?.currentQty?.toFixed(4) || '0' }}</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-6" v-if="operation.status === 'open' && operation.metrics?.avgBuyPrice">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-caption text-grey">Precio medio</div>
              <div class="text-h6">{{ operation.metrics.avgBuyPrice.toFixed(2) }} €</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-6" v-if="operation.status === 'open' && operation.metrics?.currentInvestment">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-caption text-grey">Inversión actual</div>
              <div class="text-h6">{{ operation.metrics.currentInvestment.toFixed(2) }} €</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-6" v-if="operation.status === 'open'">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-caption text-grey">Ganancia/Pérdida actual</div>
              <div
                v-if="operation.metrics?.unrealizedPnL !== undefined && operation.metrics?.unrealizedPnL !== null"
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

        <div class="col-6" v-if="operation.status === 'open'">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-caption text-grey">% Ganancia/Pérdida</div>
              <div
                v-if="operation.metrics?.pnlPercentage !== undefined && operation.metrics?.pnlPercentage !== null"
                class="text-h6"
                :class="operation.metrics.pnlPercentage >= 0 ? 'text-positive' : 'text-negative'"
              >
                {{ operation.metrics.pnlPercentage >= 0 ? '+' : '' }}{{ operation.metrics.pnlPercentage.toFixed(2) }}%
              </div>
              <div v-else class="text-h6 text-grey-6">
                <q-icon name="warning" color="orange" />
                Sin precio actual
              </div>
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
      <q-card flat bordered class="q-mb-md" v-if="currentPrice">
        <q-card-section>
          <div class="row items-center">
            <div class="text-h6 col">Precio actual</div>
            <q-btn
              flat
              dense
              round
              icon="add"
              color="primary"
              @click="showPriceForm = true"
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

      <!-- Botones de acción -->
      <div class="q-mt-md row q-gutter-sm">
        <q-btn label="Volver" color="primary" :to="{ name: 'operations' }" />
        <q-btn
          label="Eliminar operación"
          color="negative"
          outline
          @click="confirmDelete"
        />
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
import { operationTypes, operationStatus, products } from 'src/config';
import EntriesList from '../components/EntriesList.vue';
import EntryForm from '../components/EntryForm.vue';
import PriceHistoryForm from 'src/modules/symbols/components/PriceHistoryForm.vue';
import { useQuasar } from 'quasar';

const appStore = useAppStore();
const operationsStore = useOperationsStore();
const route = useRoute();
const router = useRouter();
const $q = useQuasar();

const operationId = computed(() => route.params.id as string);
const loading = ref(false);
const showEntryForm = ref(false);
const showPriceForm = ref(false);
const editingEntry = ref(null);

const operation = computed(() => operationsStore.currentOperation);

const currentPrice = computed(() => {
  return operation.value?.symbol?.priceHistory?.[0] || null;
});

onMounted(async () => {
  await refreshOperation();
});

const refreshOperation = async () => {
  loading.value = true;
  try {
    await operationsStore.fetchOperationDetail(operationId.value);
    appStore.setSection(
      `Operación: ${operation.value?.symbol?.code || 'Detalle'}`
    );
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
  return op.type === 'long' ? 'green' : 'orange';
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
    message: '¿Estás seguro de que deseas eliminar esta operación? Esta acción no se puede deshacer.',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void deleteOperation();
  });
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
</script>
