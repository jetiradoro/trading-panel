<template>
  <div class="q-pa-md">
    <div class="row q-gutter-md">
      <q-select
        v-model="localFilters.status"
        :options="statusOptions"
        label="Estado"
        outlined
        dense
        clearable
        emit-value
        map-options
        class="col"
        @update:model-value="emitFilters"
      />
      <q-select
        v-model="localFilters.product"
        :options="productOptions"
        label="Producto"
        outlined
        dense
        clearable
        emit-value
        map-options
        class="col"
        @update:model-value="emitFilters"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { operationStatus, products } from 'src/config';

const emit = defineEmits<{
  filter: [filters: { status: string; product: string }];
}>();

const localFilters = ref({
  status: '',
  product: '',
});

const statusOptions = operationStatus.map((s) => ({
  label: s.label,
  value: s.code,
}));

const productOptions = products.map((p) => ({
  label: p.label,
  value: p.code,
}));

const emitFilters = () => {
  emit('filter', localFilters.value);
};
</script>
