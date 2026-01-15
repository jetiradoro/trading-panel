<template>
  <div>
    <q-list v-if="displayGroups.length > 0" class="q-mt-md">
      <div v-for="(group, index) in displayGroups" :key="`${group.title}-${index}`">
        <q-item-label header class="text-grey-7">{{ group.title }}</q-item-label>
        <OperationListItem
          v-for="operation in group.operations"
          :key="operation.id"
          :operation="operation"
          @delete="handleDelete"
        />
      </div>
    </q-list>
    <div v-else class="text-center q-pa-md text-grey">No hay operaciones disponibles</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
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

const props = defineProps<{
  operations?: Operation[];
  groups?: { title: string; operations: Operation[] }[];
}>();

const emit = defineEmits<{
  delete: [operationId: string];
}>();

const handleDelete = (operationId: string) => {
  emit('delete', operationId);
};

const displayGroups = computed(() => {
  if (props.groups && props.groups.length > 0) {
    return props.groups;
  }
  if (props.operations && props.operations.length > 0) {
    return [{ title: 'Operaciones', operations: props.operations }];
  }
  return [];
});
</script>
