<template>
  <div class="q-pa-md">
    <div class="row items-center q-col-gutter-md">
      <div class="text-subtitle2 text-grey-8 col-12 col-md-auto">Estado</div>
      <q-btn-toggle
        v-model="localFilters.status"
        :options="statusTabs"
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
        @update:model-value="emitFilters"
      />
      <div class="text-subtitle2 text-grey-8 col-12 col-md-auto">Producto</div>
      <q-btn-toggle
        v-model="localFilters.product"
        :options="productToggleOptions"
        rounded
        no-caps
        color="grey-2"
        text-color="grey-8"
        toggle-color="primary"
        toggle-text-color="white"
        size="md"
        spread
        class="col-12 col-md-auto"
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
  status: 'all',
  product: 'all',
});

const statusTabs = [
  { label: 'Todas', value: 'all' },
  ...operationStatus.map((s) => ({ label: s.label, value: s.code })),
];

const productToggleOptions = [
  { label: 'Todos', value: 'all' },
  ...products.map((p) => ({ label: p.label, value: p.code })),
];

/** Normaliza filtros para el listado. */
const normalizeFilters = (filters: { status: string; product: string }) => ({
  status: filters.status === 'all' ? '' : filters.status,
  product: filters.product === 'all' ? '' : filters.product,
});

/** Emite filtros normalizados. */
const emitFilters = () => {
  emit('filter', normalizeFilters(localFilters.value));
};
</script>
