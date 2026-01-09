<template>
  <div>
    <q-list v-if="operations.length > 0" class="q-mt-md">
      <OperationListItem
        v-for="operation in operations"
        :key="operation.id"
        :operation="operation"
        @delete="handleDelete"
      />
    </q-list>
    <div v-else class="text-center q-pa-md text-grey">No hay operaciones disponibles</div>
  </div>
</template>

<script setup lang="ts">
import OperationListItem from './OperationListItem.vue';

interface Operation {
  id: string;
  accountId: string;
  userId: string;
  symbolId: string;
  product: string;
  type: string;
  status: string;
  balance?: number;
  createdAt: string;
  updatedAt: string;
  symbol?: {
    id: string;
    code: string;
    name: string;
    logo?: string;
  };
  currentQty?: number;
  avgPrice?: number;
  unrealizedPnL?: number;
}

defineProps<{
  operations: Operation[];
}>();

const emit = defineEmits<{
  delete: [operationId: string];
}>();

const handleDelete = (operationId: string) => {
  emit('delete', operationId);
};
</script>
