<template>
  <q-select
    :model-value="modelValue"
    :options="options"
    :label="label"
    outlined
    dense
    emit-value
    map-options
    class="q-mb-md"
    @update:model-value="emitValue"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { useSymbolsStore } from 'src/modules/symbols/SymbolsStore';

const props = defineProps<{
  modelValue: string;
  label?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [string];
}>();

const symbolsStore = useSymbolsStore();

const options = computed(() =>
  symbolsStore.marketProviders.map((provider) => ({
    label: provider.label,
    value: provider.code,
  })),
);

const label = computed(() => props.label || 'Market Provider');

const emitValue = (value: string) => {
  emit('update:modelValue', value);
};

onMounted(async () => {
  if (!symbolsStore.marketProviders.length) {
    await symbolsStore.fetchMarketProviders();
  }
});

watch(
  () => [props.modelValue, symbolsStore.defaultMarketProvider],
  ([current, defaultProvider]) => {
    if (!current && defaultProvider) {
      emit('update:modelValue', defaultProvider);
    }
  },
  { immediate: true },
);
</script>
