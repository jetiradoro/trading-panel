<template>
  <q-slide-item class="operation-slide-item" @left="onSlideLeft" left-color="red-3">
    <template #left>
      <div class="slide-action bg-red-3 text-white row items-center justify-end rounded-borders">
        <q-icon name="delete" size="sm" />
      </div>
    </template>

    <q-item clickable class="operation-item" @click="goToDetail">
      <q-item-section avatar>
        <q-avatar :color="statusColor" text-color="white" size="md">
          <q-icon :name="productIcon" />
        </q-avatar>
      </q-item-section>

      <q-item-section>
        <q-item-label>{{ operation.symbol?.code || 'N/A' }}</q-item-label>
        <q-item-label caption>{{ operation.symbol?.name || 'N/A' }}</q-item-label>
      </q-item-section>

      <q-item-section>
        <q-item-label>
          <q-badge :color="typeColor" :label="typeLabel" />
        </q-item-label>
        <q-item-label caption>{{ formatDate(operation.createdAt) }}</q-item-label>
      </q-item-section>

      <q-item-section side>
        <q-item-label v-if="operation.status === 'closed' && operation.balance !== undefined">
          <span :class="operation.balance >= 0 ? 'text-positive' : 'text-negative'">
            {{ operation.balance.toFixed(2) }} €
          </span>
        </q-item-label>
        <q-item-label v-else-if="operation.metrics?.unrealizedPnL !== undefined && operation.metrics?.unrealizedPnL !== null">
          <span :class="operation.metrics.unrealizedPnL >= 0 ? 'text-positive' : 'text-negative'">
            {{ operation.metrics.unrealizedPnL.toFixed(2) }} €
          </span>
        </q-item-label>
        <q-item-label caption>
          <q-chip :color="statusColor" text-color="white" dense size="sm">
            {{ statusLabel }}
          </q-chip>
        </q-item-label>
      </q-item-section>
    </q-item>
  </q-slide-item>
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

interface Operation {
  id: string;
  product: string;
  type: string;
  status: string;
  balance?: number;
  createdAt: string;
  symbol?: {
    code: string;
    name: string;
  };
  metrics?: OperationMetrics;
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
  return props.operation.type === 'long' ? 'green' : 'orange';
});

const statusLabel = computed(() => {
  const status = operationStatus.find((s) => s.code === props.operation.status);
  return status?.label || props.operation.status;
});

const statusColor = computed(() => {
  const status = operationStatus.find((s) => s.code === props.operation.status);
  return status?.color || 'grey';
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
.operation-slide-item {
  overflow: hidden;
}

.operation-item {
  min-height: 72px;
  display: flex;
  align-items: center;
}

.slide-action {
  width: 100%;
  height: 100%;
  padding: 0 16px;
}
</style>
