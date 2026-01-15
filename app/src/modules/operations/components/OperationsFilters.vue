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
      <div class="col" />
      <div class="col-12 col-md-4">
        <q-input
          v-model="localFilters.search"
          outlined
          dense
          clearable
          debounce="250"
          placeholder="Codigo o nombre"
          class="full-width"
          @update:model-value="emitFilters"
        >
          <template #append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { operationStatus, products } from 'src/config';

const emit = defineEmits<{
  filter: [filters: { status: string; product: string; search: string }];
}>();

const localFilters = ref({
  status: 'open',
  product: 'all',
  search: '',
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
const normalizeFilters = (filters: { status: string; product: string; search: string }) => ({
  status: filters.status === 'all' ? '' : filters.status,
  product: filters.product === 'all' ? '' : filters.product,
  search: filters.search?.trim() ?? '',
});

/** Emite filtros normalizados. */
const emitFilters = () => {
  emit('filter', normalizeFilters(localFilters.value));
};
</script>
