<template>
  <div class="operation-item-wrapper">
    <q-slide-item class="operation-slide-item" @left="onSlideLeft" left-color="red-3">
      <template #left>
        <div class="slide-action bg-red-3 text-white row items-center justify-end rounded-borders">
          <q-icon name="delete" size="sm" />
        </div>
      </template>

      <q-item
        clickable
        :class="['operation-item', operation.status === 'closed' ? 'text-negative' : '']"
        @click="goToDetail"
      >
        <q-item-section avatar>
          <q-avatar v-if="operation.symbol?.logo" size="md">
            <img :src="operation.symbol.logo" :alt="operation.symbol.code" />
          </q-avatar>
          <q-avatar v-else :color="statusColor" text-color="white" size="md">
            <q-icon :name="productIcon" />
          </q-avatar>
        </q-item-section>

        <q-item-section>
          <q-item-label class="row items-center no-wrap">
            <q-icon
              v-if="marketSyncEnabled"
              name="fiber_manual_record"
              color="positive"
              size="8px"
              class="q-mr-xs"
            >
              <q-tooltip>Market Sync configurado</q-tooltip>
            </q-icon>
            <span>{{ operation.symbol?.code || 'N/A' }}</span>
          </q-item-label>
          <q-item-label caption>{{ operation.symbol?.name || 'N/A' }}</q-item-label>
        </q-item-section>

        <q-item-section>
          <q-item-label>
            <q-badge :color="typeColor" :label="typeLabel" />
          </q-item-label>
          <q-item-label caption>{{ formatDate(firstEntryDate) }}</q-item-label>
        </q-item-section>

        <q-item-section side>
          <q-item-label v-if="operation.status === 'closed' && operation.balance !== undefined">
            <span :class="operation.balance >= 0 ? 'text-positive' : 'text-negative'">
              {{ operation.balance.toFixed(2) }} €
            </span>
          </q-item-label>
          <q-item-label
            v-else-if="
              operation.metrics?.unrealizedPnL !== undefined &&
              operation.metrics?.unrealizedPnL !== null
            "
          >
            <span :class="operation.metrics.unrealizedPnL >= 0 ? 'text-positive' : 'text-negative'">
              {{ operation.metrics.unrealizedPnL.toFixed(2) }} €
            </span>
          </q-item-label>
          <q-item-label v-if="pnlPercentageDisplay" caption>
            <span :class="pnlPercentageDisplay.className">
              {{ pnlPercentageDisplay.text }}
            </span>
          </q-item-label>
          <q-item-label v-if="operation.totalFees !== undefined" caption :class="statusColor">
            Comisiones: {{ operation.totalFees.toFixed(2) }} €
          </q-item-label>
          <q-item-label caption>
            <q-chip :color="statusColor" text-color="white" dense size="sm">
              {{ statusLabel }}
            </q-chip>
          </q-item-label>
        </q-item-section>
      </q-item>
    </q-slide-item>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { operationTypes, operationStatus, products } from 'src/config';

interface OperationMetrics {
  currentQty: number;
  avgBuyPrice: number;
  unrealizedPnL: number | null;
  pnlPercentage: number | null;
  currentInvestment: number | null;
  buyQty: number;
  sellQty: number;
}

interface OperationEntry {
  date: string;
}

interface Operation {
  id: string;
  product: string;
  type: string;
  status: string;
  balance?: number;
  totalFees?: number;
  createdAt: string;
  symbol?: {
    code: string;
    name: string;
    logo?: string;
    marketCode?: string;
    marketProvider?: string;
  };
  metrics?: OperationMetrics;
  entries?: OperationEntry[];
}

const props = defineProps<{
  operation: Operation;
}>();

const emit = defineEmits<{
  delete: [operationId: string];
}>();

const router = useRouter();

const onSlideLeft = ({ reset }: { reset: () => void }) => {
  reset();
  emit('delete', props.operation.id);
};

const goToDetail = () => {
  void router.push({ name: 'operations.detail', params: { id: props.operation.id } });
};

const typeLabel = computed(() => {
  const type = operationTypes.find((t) => t.code === props.operation.type);
  return type?.label || props.operation.type;
});

const typeColor = computed(() => {
  return props.operation.type === 'long' ? 'open' : 'orange';
});

const statusLabel = computed(() => {
  const status = operationStatus.find((s) => s.code === props.operation.status);
  return status?.label || props.operation.status;
});

const statusColor = computed(() => {
  const status = operationStatus.find((s) => s.code === props.operation.status);
  return status?.color || 'grey';
});

const negativeTextClass = computed(() => {
  return props.operation.status === 'closed' ? 'text-dark' : 'text-negative';
});

const productIcon = computed(() => {
  const product = products.find((p) => p.code === props.operation.product);
  switch (product?.code) {
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

const marketSyncEnabled = computed(() => {
  const symbol = props.operation.symbol;
  return !!symbol?.marketCode && !!symbol?.marketProvider;
});

const firstEntryDate = computed(() => {
  const entries = props.operation.entries;
  if (!entries || entries.length === 0) return props.operation.createdAt;
  const [firstEntry] = entries;
  if (!firstEntry) return props.operation.createdAt;
  return entries.reduce((oldest, entry) => {
    return new Date(entry.date).getTime() < new Date(oldest).getTime() ? entry.date : oldest;
  }, firstEntry.date);
});

const pnlPercentageDisplay = computed(() => {
  const value = props.operation.metrics?.pnlPercentage;
  if (value === undefined || value === null) return null;
  return {
    value,
    text: formatPercentage(value),
    className: value >= 0 ? 'text-positive' : negativeTextClass.value,
  };
});

const formatPercentage = (value: number) => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};
</script>

<style scoped>
.operation-item-wrapper {
  margin-bottom: 0.2rem;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}

.operation-item-wrapper:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.25);
}

.operation-slide-item {
  overflow: hidden;
  border-radius: 8px;
}

.operation-item {
  min-height: 72px;
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.05);
}

.slide-action {
  width: 100%;
  height: 100%;
  padding: 0 16px;
}

.q-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.text-negative {
  color: #ff6b6b !important;
}
</style>
